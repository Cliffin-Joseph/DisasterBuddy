import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { loadAlertRadius, refreshGdacsAlerts } from '../services/gdacsService';
import logger from '../services/logger';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export default function GdacsMonitor() {
  useEffect(() => {
    let monitorIsActive = true;

    async function checkForNewAlerts() {
      try {
        const [locationPermission, radiusKm] = await Promise.all([
          Location.getForegroundPermissionsAsync(),
          loadAlertRadius(),
        ]);

        let currentLocation = null;

        if (locationPermission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }

        const nearbyFilterNeedsLocation = Number.isFinite(radiusKm) && !currentLocation;
        if (!monitorIsActive || nearbyFilterNeedsLocation) {
          return;
        }

        await refreshGdacsAlerts({ location: currentLocation, radiusKm });
      } catch (error) {
        logger.warn('gdacs_background_check_failed', error);
      }
    }

    checkForNewAlerts();
    const checkInterval = setInterval(checkForNewAlerts, CHECK_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkForNewAlerts();
      }
    });

    return () => {
      monitorIsActive = false;
      clearInterval(checkInterval);
      appStateSubscription.remove();
    };
  }, []);

  return null;
}
