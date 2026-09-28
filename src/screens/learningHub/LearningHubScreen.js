import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/styles';

export default function LearningHubScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.brand}>DisasterBuddy</Text>
        <Text style={styles.eyebrow}>FUTURE FEATURE</Text>
        <Text style={styles.title}>Learning Hub</Text>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>◌</Text>
          <Text style={styles.cardTitle}>Coming soon</Text>
          <Text style={[styles.muted, styles.centerText]}>Scenario quizzes and disaster guidance will be implemented during full development.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
