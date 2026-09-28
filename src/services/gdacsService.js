import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const FEED_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,TC,FL,VO,DR,WF&alertlevel=Green,Orange,Red&limit=100';
const CACHE_KEY = 'disasterbuddy.gdacs.events.v1';
const SEEN_KEY = 'disasterbuddy.gdacs.seen.v1';
const FILTER_KEY = 'disasterbuddy.gdacs.radius.v1';
const EVENT_TYPES = {
  EQ: 'Earthquake',
  TC: 'Tropical cyclone',
  FL: 'Flood',
  VO: 'Volcano',
  DR: 'Drought',
  WF: 'Wildfire',
};

const DEFAULT_RADIUS_KM = 500;
const MAXIMUM_VISIBLE_EVENTS = 20;
const MAXIMUM_NEW_EVENT_NOTIFICATIONS = 3;

export async function loadCachedAlerts() {
  try {
    const storedAlerts = await AsyncStorage.getItem(CACHE_KEY);
    return JSON.parse(storedAlerts) ?? { events: [], updatedAt: null };
  } catch {
    return { events: [], updatedAt: null };
  }
}

function convertFeatureToEvent(feature) {
  const properties = feature.properties ?? {};
  const coordinates = feature.geometry?.type === 'Point'
    ? feature.geometry.coordinates
    : [];
  const [longitude, latitude] = coordinates;

  const affectedCountryNames = properties.affectedcountries
    ?.map((country) => country.countryname)
    .join(', ');

  return {
    id: `${properties.eventtype}-${properties.eventid}-${properties.episodeid}`,
    type: EVENT_TYPES[properties.eventtype] ?? properties.eventtype,
    typeCode: properties.eventtype,
    title: properties.name || properties.description || 'GDACS event',
    country: properties.country || affectedCountryNames || 'Location unavailable',
    alertLevel: properties.alertlevel || 'Green',
    severity: properties.severitydata?.severitytext?.trim() || '',
    fromDate: properties.fromdate || null,
    toDate: properties.todate || null,
    modifiedAt: properties.datemodified || null,
    reportUrl: properties.url?.report || 'https://www.gdacs.org/',
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Uses the Haversine formula to estimate distance across the Earth's surface.
function calculateDistanceKm(userLocation, event) {
  const eventHasNoCoordinates = event.latitude === null || event.longitude === null;

  if (!userLocation || eventHasNoCoordinates) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDifference = degreesToRadians(event.latitude - userLocation.latitude);
  const longitudeDifference = degreesToRadians(event.longitude - userLocation.longitude);

  const haversineValue =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(degreesToRadians(userLocation.latitude))
      * Math.cos(degreesToRadians(event.latitude))
      * Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle = 2 * Math.atan2(
    Math.sqrt(haversineValue),
    Math.sqrt(1 - haversineValue),
  );

  return Math.round(earthRadiusKm * centralAngle);
}

function isEventWithinRadius(event, userLocation, radiusKm) {
  if (!Number.isFinite(radiusKm)) {
    return true;
  }

  return Boolean(
    userLocation
      && event.distanceKm !== null
      && event.distanceKm <= radiusKm,
  );
}

function sortEvents(events, userLocation) {
  return [...events].sort((firstEvent, secondEvent) => {
    if (userLocation) {
      const firstDistance = firstEvent.distanceKm ?? Infinity;
      const secondDistance = secondEvent.distanceKm ?? Infinity;
      return firstDistance - secondDistance;
    }

    const firstDate = firstEvent.modifiedAt ?? '';
    const secondDate = secondEvent.modifiedAt ?? '';
    return secondDate.localeCompare(firstDate);
  });
}

export async function loadAlertRadius() {
  const storedRadius = Number(await AsyncStorage.getItem(FILTER_KEY));
  return storedRadius || DEFAULT_RADIUS_KM;
}

export async function saveAlertRadius(radiusKm) {
  await AsyncStorage.setItem(FILTER_KEY, String(radiusKm));
}

async function sendNewEventNotifications(events) {
  if (events.length === 0) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    return;
  }

  const notificationRequests = events.map((event) => {
    const countryText = event.country ? ` · ${event.country}` : '';

    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${event.alertLevel} GDACS alert: ${event.type}`,
        body: `${event.title}${countryText}`,
        data: {
          alertId: event.id,
          reportUrl: event.reportUrl,
        },
      },
      trigger: null,
    });
  });

  await Promise.all(notificationRequests);
}

export async function refreshGdacsAlerts({ notify = true, location = null, radiusKm = Infinity } = {}) {
  const response = await fetch(FEED_URL, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`GDACS returned ${response.status}`);
  }

  const data = await response.json();
  const allEvents = (data.features ?? []).map((feature) => {
    const event = convertFeatureToEvent(feature);
    return {
      ...event,
      distanceKm: calculateDistanceKm(location, event),
    };
  });

  const eventsWithinRadius = allEvents.filter((event) => (
    isEventWithinRadius(event, location, radiusKm)
  ));

  const visibleEvents = sortEvents(eventsWithinRadius, location)
    .slice(0, MAXIMUM_VISIBLE_EVENTS);

  const storedSeenIds = await AsyncStorage.getItem(SEEN_KEY);
  const previouslySeenIds = JSON.parse(storedSeenIds || 'null');
  const currentEventIds = allEvents.map((event) => event.id);
  const updatedAt = new Date().toISOString();

  await Promise.all([
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ events: visibleEvents, updatedAt })),
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify(currentEventIds)),
  ]);

  // A missing seen list means this is the first refresh. In that case, establish
  // a baseline without notifying the user about every existing GDACS event.
  if (notify && previouslySeenIds) {
    const seenIds = new Set(previouslySeenIds);
    const newNearbyEvents = eventsWithinRadius
      .filter((event) => !seenIds.has(event.id))
      .slice(0, MAXIMUM_NEW_EVENT_NOTIFICATIONS);

    await sendNewEventNotifications(newNearbyEvents);
  }

  return { events: visibleEvents, updatedAt };
}
