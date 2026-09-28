import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logger from '../services/logger';

export default class AppErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, errorDetails) {
    logger.error('unhandled_render_error', error, {
      componentStack: errorDetails.componentStack,
    });
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={local.safeArea}>
        <View style={local.card}>
          <Text style={local.icon}>!</Text>
          <Text style={local.title}>DisasterBuddy needs to recover</Text>
          <Text style={local.text}>
            An unexpected display error occurred. Your saved preparedness
            information has not been reset.
          </Text>
          <Pressable
            onPress={() => this.setState({ failed: false })}
            style={local.button}
          >
            <Text style={local.buttonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const local = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F4EE', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E4DDD1' },
  icon: { width: 48, height: 48, borderRadius: 16, lineHeight: 48, textAlign: 'center', color: '#FFFFFF', backgroundColor: '#C95345', fontSize: 22, fontWeight: '900' },
  title: { color: '#17211C', fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 15 },
  text: { color: '#64736A', lineHeight: 21, textAlign: 'center', marginTop: 8 },
  button: { backgroundColor: '#2E7D58', borderRadius: 13, paddingHorizontal: 22, paddingVertical: 13, marginTop: 18 },
  buttonText: { color: '#FFFFFF', fontWeight: '900' },
});
