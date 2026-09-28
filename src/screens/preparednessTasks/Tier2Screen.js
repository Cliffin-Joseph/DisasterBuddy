import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDisasterBuddy } from '../../logic/appLogic';
import styles from '../../styles/styles';

export default function Tier2Screen() {
  const { metrics } = useDisasterBuddy();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>TIER 2</Text>
        <Text style={styles.title}>{metrics.tier2Unlocked ? 'Extended Preparedness' : 'Tier 2 is locked'}</Text>
        <Text style={styles.body}>{metrics.tier2Unlocked
          ? 'The prototype has demonstrated tier progression. Full Tier 2 tasks are outside the feasibility scope.'
          : 'Complete every Tier 1 task and ensure no required item is expired.'}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preview tasks</Text>
          <Text style={styles.listItem}>• Hygiene supplies</Text>
          <Text style={styles.listItem}>• Portable radio</Text>
          <Text style={styles.listItem}>• Household medication plan</Text>
          <Text style={styles.listItem}>• Supplies for children, elderly members or pets</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
