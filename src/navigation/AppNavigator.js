import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import KitScreen from '../screens/preparednessTasks/KitScreen';
import TaskDetailScreen from '../screens/preparednessTasks/TaskDetailScreen';
import Tier2Screen from '../screens/preparednessTasks/Tier2Screen';
import TierChecklistScreen from '../screens/preparednessTasks/TierChecklistScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import AlertDetailScreen from '../screens/alerts/AlertDetailScreen';
import LocalHelpScreen from '../screens/resourceLibrary/LocalHelpScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ResourceLibraryScreen from '../screens/resourceLibrary/ResourceLibraryScreen';
import ResourceCategoryScreen from '../screens/resourceLibrary/ResourceCategoryScreen';
import ResourceDetailScreen from '../screens/resourceLibrary/ResourceDetailScreen';
import QuizScreen from '../screens/learningHub/QuizScreen';
import QuizResultScreen from '../screens/learningHub/QuizResultScreen';
import QuizHistoryScreen from '../screens/learningHub/QuizHistoryScreen';
import QuizCategoriesScreen from '../screens/learningHub/QuizCategoriesScreen';
import RewardsScreen from '../screens/rewards/RewardsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICON_URLS = {
  home: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png',
  kit: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
  learn: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  alerts: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png',
  profile: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
};

function createTabIcon(iconName) {
  return function TabIcon({ color, size }) {
    return (
      <Image
        accessible={false}
        accessibilityIgnoresInvertColors
        source={{ uri: TAB_ICON_URLS[iconName] }}
        style={{ width: size, height: size, tintColor: color }}
      />
    );
  };
}

function PreparednessStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KitHome" component={KitScreen} />
      <Stack.Screen name="TierChecklist" component={TierChecklistScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="Tier2" component={Tier2Screen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
    </Stack.Navigator>
  );
}

function ResourceLibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResourceLibrary" component={ResourceLibraryScreen} options={{ title: 'Resource Hub' }} />
      <Stack.Screen name="LocalHelp" component={LocalHelpScreen} />
      <Stack.Screen name="ResourceCategory" component={ResourceCategoryScreen} options={{ title: 'Resources' }} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} options={{ title: 'Guidance' }} />
      <Stack.Screen name="QuizCategories" component={QuizCategoriesScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="QuizHistory" component={QuizHistoryScreen} />
    </Stack.Navigator>
  );
}

function AlertsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlertsHome" component={AlertsScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
      <Stack.Screen name="LocalHelp" component={LocalHelpScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { fontScale } = useWindowDimensions();
  const tabBarHeight = Math.min(112, Math.max(72, Math.round(72 * fontScale)));

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2E7D58',
          tabBarInactiveTintColor: '#8B9991',
          tabBarStyle: { height: tabBarHeight, paddingTop: 8, paddingBottom: 8 },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home', tabBarIcon: createTabIcon('home') }} />
        <Tab.Screen name="KitTab" component={PreparednessStack} options={{ title: 'Kit', tabBarIcon: createTabIcon('kit') }} />
        <Tab.Screen name="LearnTab" component={ResourceLibraryStack} options={{ title: 'Learn', tabBarIcon: createTabIcon('learn') }} />
        <Tab.Screen name="AlertsTab" component={AlertsStack} options={{ title: 'Alerts', tabBarIcon: createTabIcon('alerts') }} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: createTabIcon('profile') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
