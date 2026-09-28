import React, { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, ScreenBackdrop } from '../../components/UIComponents';
import { getExpiryState, useDisasterBuddy } from '../../logic/appLogic';
import { loadAlertRadius, loadCachedAlerts, refreshGdacsAlerts, saveAlertRadius } from '../../services/gdacsService';
import styles from '../../styles/styles';
import logger from '../../services/logger';

const ALERT_SECTIONS = [
  { key: 'alerts', label: 'Alerts' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'attention', label: 'Needs attention' },
];

const RADIUS_OPTIONS = [
  { value: 100, label: '100 km' },
  { value: 500, label: '500 km' },
  { value: 2000, label: '2,000 km' },
  { value: Infinity, label: 'Worldwide' },
];

function findExpiringItems(tasks) {
  const itemsWithTaskDetails = [];

  tasks.forEach((task) => {
    const taskItems = task.items ?? [];

    taskItems.forEach((item) => {
      const expiryState = item.expiryDate
        ? getExpiryState(item.expiryDate)
        : 'none';

      itemsWithTaskDetails.push({
        ...item,
        taskTitle: task.shortTitle,
        state: expiryState,
      });
    });
  });

  return itemsWithTaskDetails
    .filter((item) => item.state === 'soon' || item.state === 'expired')
    .sort((firstItem, secondItem) => {
      const firstExpiry = firstItem.expiryDate ?? '';
      const secondExpiry = secondItem.expiryDate ?? '';
      return firstExpiry.localeCompare(secondExpiry);
    });
}

export default function AlertsScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState('alerts');
  const [feed, setFeed] = useState({ events: [], updatedAt: null });
  const [location, setLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(500);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState('');
  const { tasks, reminderPermission, enableExpiryReminders } = useDisasterBuddy();
  const expiringItems = findExpiringItems(tasks);

  const refreshFeed = useCallback(async (showSpinner = true, nextLocation = location, nextRadius = radiusKm) => {
    if (showSpinner) {
      setRefreshing(true);
    }

    setFeedError('');

    try {
      const refreshedFeed = await refreshGdacsAlerts({
        location: nextLocation,
        radiusKm: nextRadius,
      });
      setFeed(refreshedFeed);
    } catch (error) {
      const radiusForLog = Number.isFinite(nextRadius) ? nextRadius : 'worldwide';
      logger.warn('gdacs_feed_refresh_failed', error, { radiusKm: radiusForLog });
      setFeedError('Live refresh unavailable. Showing the most recently cached alerts.');
    } finally {
      setRefreshing(false);
    }
  }, [location, radiusKm]);

  const enableLocationFiltering = async (nextRadius = radiusKm) => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        'Location not enabled',
        'Use Worldwide to view alerts without sharing your location.',
      );
      return;
    }

    setRefreshing(true);

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(currentLocation);
      await refreshFeed(false, currentLocation, nextRadius);
    } catch (error) {
      logger.warn('alert_location_lookup_failed', error);
      setFeedError('Your location could not be determined. Worldwide alerts remain available.');
    } finally {
      setRefreshing(false);
    }
  };

  const chooseRadius = async (selectedRadius) => {
    setRadiusKm(selectedRadius);
    await saveAlertRadius(selectedRadius);

    const selectedNearbyRadiusWithoutLocation = Number.isFinite(selectedRadius) && !location;
    if (selectedNearbyRadiusWithoutLocation) {
      await enableLocationFiltering(selectedRadius);
      return;
    }

    await refreshFeed(true, location, selectedRadius);
  };

  useFocusEffect(useCallback(() => {
    let screenIsActive = true;

    async function loadAlertsScreen() {
      const [cachedFeed, storedRadius, locationPermission] = await Promise.all([
        loadCachedAlerts(),
        loadAlertRadius(),
        Location.getForegroundPermissionsAsync(),
      ]);

      if (!screenIsActive) {
        return;
      }

      setFeed(cachedFeed);
      setRadiusKm(storedRadius);
      let currentLocation = null;

      if (locationPermission.status === 'granted') {
        const fifteenMinutes = 15 * 60 * 1000;
        const lastPosition = await Location.getLastKnownPositionAsync({
          maxAge: fifteenMinutes,
        });

        if (lastPosition) {
          currentLocation = {
            latitude: lastPosition.coords.latitude,
            longitude: lastPosition.coords.longitude,
          };
        }
      }

      if (!screenIsActive) {
        return;
      }

      setLocation(currentLocation);
      refreshFeed(false, currentLocation, storedRadius);
    }

    loadAlertsScreen().catch((error) => {
      logger.warn('alerts_screen_load_failed', error);
      setFeedError('Alerts could not be loaded. Pull down to try again.');
    });

    return () => {
      screenIsActive = false;
    };
  }, []));

  const enableNotifications = async () => {
    const status = await enableExpiryReminders();
    const notificationsWereEnabled = status === 'granted';
    const title = notificationsWereEnabled
      ? 'Notifications enabled'
      : 'Notifications unavailable';
    const message = notificationsWereEnabled
      ? 'Item-expiry reminders and newly detected orange/red events inside your chosen proximity can now notify you.'
      : 'Enable notifications in device settings if you want reminders.';

    Alert.alert(title, message);
  };

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScreenBackdrop variant="red" /><ScrollView refreshControl={activeSection === 'alerts' ? <RefreshControl refreshing={refreshing} onRefresh={refreshFeed} colors={['#2E7D58']} /> : undefined} contentContainerStyle={styles.page}>
    <Text style={styles.brand}>DisasterBuddy</Text><Text style={styles.eyebrow}>STAY INFORMED</Text><Text style={styles.title}>Alerts and reminders</Text>
    <AppButton secondary label="Local help in Singapore" onPress={() => navigation.navigate('LocalHelp')} />
    <View accessibilityRole="tablist" style={styles.segmentedControl}>{ALERT_SECTIONS.map((section) => <Pressable key={section.key} accessibilityRole="tab" accessibilityState={{ selected: activeSection === section.key }} onPress={() => setActiveSection(section.key)} style={[styles.segmentButton, activeSection === section.key && styles.segmentButtonActive]}><Text style={[styles.segmentText, activeSection === section.key && styles.segmentTextActive]}>{section.label}</Text>{section.key === 'attention' && expiringItems.length > 0 ? <View style={styles.segmentBadge}><Text style={styles.segmentBadgeText}>{expiringItems.length}</Text></View> : null}</Pressable>)}</View>
    {activeSection === 'alerts' && <>
      <View style={styles.proximityCard}><View style={styles.profileCompletionRow}><View><Text style={styles.cardTitle}>Alert proximity</Text><Text style={styles.muted}>{location ? 'Sorted nearest first' : 'Location is not enabled'}</Text></View>{!location && <Pressable onPress={enableLocationFiltering}><Text style={styles.inventoryAction}>Use my location</Text></Pressable>}</View><View style={styles.radiusRow}>{RADIUS_OPTIONS.map((option) => <Pressable key={option.label} onPress={() => chooseRadius(option.value)} style={[styles.radiusChip, radiusKm === option.value && styles.radiusChipActive]}><Text style={[styles.radiusChipText, radiusKm === option.value && styles.radiusChipTextActive]}>{option.label}</Text></Pressable>)}</View><Text style={styles.fieldHelp}>Your coordinates are used in memory for distance calculations and are not saved.</Text></View>
      <View style={styles.alertFeedHeader}><View><Text style={styles.sectionTitle}>Current GDACS events</Text><Text style={styles.muted}>{feed.updatedAt ? `${feed.events.length} shown · Updated ${new Date(feed.updatedAt).toLocaleString()}` : 'Connecting to GDACS…'}</Text></View><View style={styles.liveBadge}><Text style={styles.liveBadgeText}>GDACS</Text></View></View>
      {feedError ? <Text style={styles.inlineWarning}>{feedError}</Text> : null}
      {feed.events.length === 0 && !feedError ? <View style={styles.emptyInventory}><Text style={styles.muted}>No events found inside this radius. Try a wider filter.</Text></View> : feed.events.map((event) => <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={`View details: ${event.title}`} onPress={() => navigation.navigate('AlertDetail', { event, updatedAt: feed.updatedAt })} style={styles.hazardCard}><View style={[styles.alertLevelBar, event.alertLevel === 'Orange' && styles.alertLevelOrange, event.alertLevel === 'Red' && styles.alertLevelRed]} /><View style={{ flex: 1 }}><View style={styles.hazardMeta}><Text style={styles.hazardType}>{event.type}</Text><Text style={[styles.alertLevelText, event.alertLevel === 'Orange' && styles.alertLevelTextOrange, event.alertLevel === 'Red' && styles.alertLevelTextRed]}>{event.alertLevel}</Text></View><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.muted}>{event.country}{Number.isFinite(event.distanceKm) ? ` · ${event.distanceKm.toLocaleString()} km away` : ''}</Text><Text style={styles.openReport}>View event details ›</Text></View></Pressable>)}
      <View style={styles.notice}><Text style={styles.noticeText}>Up to 20 events are shown. GDACS centroids provide approximate proximity and do not replace local-authority instructions.</Text></View>
    </>}
    {activeSection === 'reminders' && <><Text style={styles.sectionTitle}>Notifications</Text><View style={styles.permissionCard}><Text style={styles.cardTitle}>{reminderPermission === 'granted' ? 'Notifications are active' : 'Enable notifications'}</Text><Text style={styles.muted}>Preparedness items are scheduled seven days before expiry and again on their expiry day. Newly detected orange/red GDACS events notify only when they fall inside your selected proximity filter.</Text>{reminderPermission !== 'granted' && <AppButton label="Enable notifications" onPress={enableNotifications} />}</View></>}
    {activeSection === 'attention' && <><Text style={styles.sectionTitle}>Items needing attention</Text>{expiringItems.length === 0 ? <View style={styles.emptyInventory}><Text style={styles.muted}>No expired or expiring-soon items recorded.</Text></View> : expiringItems.map((item) => <View key={`${item.taskTitle}-${item.id}`} style={[styles.expiryCard, item.state === 'expired' && styles.expiryCardExpired]}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.taskTitle} · {item.expiryDate}</Text></View><Text style={[styles.expiryStatus, item.state === 'expired' && styles.expiryStatusExpired]}>{item.state === 'expired' ? 'Expired' : 'Expiring soon'}</Text></View>)}</>}
  </ScrollView></SafeAreaView>;
}
