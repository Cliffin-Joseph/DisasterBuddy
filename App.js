import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DisasterBuddyProvider } from './src/logic/appLogic';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import AuthFlow from './src/screens/auth/AuthFlow';
import GdacsMonitor from './src/components/GdacsMonitor';
import { RewardsProvider } from './src/hooks/useRewards';
import AppErrorBoundary from './src/components/AppErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider><AppErrorBoundary>
      <AuthProvider>
        <AppBootstrap />
      </AuthProvider>
    </AppErrorBoundary></SafeAreaProvider>
  );
}

function AppBootstrap() {
  const { status, error, retry } = useAuth();

  if (status === 'loading') {
    return <BootstrapState loading title="Preparing DisasterBuddy" detail="Checking your account…" />;
  }

  if (status === 'error') {
    return <BootstrapState title="Unable to connect" detail={error} onRetry={retry} />;
  }

  if (status === 'signedOut') return <AuthFlow />;

  return (
    <DisasterBuddyProvider>
      <RewardsProvider>
        <GdacsMonitor />
        <AppNavigator />
      </RewardsProvider>
    </DisasterBuddyProvider>
  );
}

function BootstrapState({ loading = false, title, detail, onRetry }) {
  return (
    <SafeAreaView style={bootstrapStyles.safeArea}>
      <View style={bootstrapStyles.content}>
        {loading && <ActivityIndicator size="large" color="#2E7D58" />}
        <Text style={bootstrapStyles.title}>{title}</Text>
        <Text style={bootstrapStyles.detail}>{detail}</Text>
        {onRetry && (
          <Pressable accessibilityRole="button" onPress={onRetry} style={bootstrapStyles.button}>
            <Text style={bootstrapStyles.buttonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const bootstrapStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F5' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { marginTop: 16, color: '#173A2A', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  detail: { marginTop: 8, color: '#6A776F', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { marginTop: 20, backgroundColor: '#2E7D58', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  buttonText: { color: '#FFFFFF', fontWeight: '800' },
});
