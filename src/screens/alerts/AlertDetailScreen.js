import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, ScreenBackdrop } from '../../components/UIComponents';
import { formatAlertDate, formatAlertDistance, getOfficialReportUrl, getRelatedGuides } from '../../utils/hazardDetails';
import { openHelpLink } from '../../services/helpLinks';
import styles from '../../styles/styles';

export default function AlertDetailScreen({ route, navigation }) {
  const { event, updatedAt } = route.params || {};
  if (!event) return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.page}>
        <Text accessibilityRole="header" style={styles.title}>Event unavailable</Text>
        <Text style={detail.text}>Return to Alerts and select an event again.</Text>
        <AppButton label="Back to alerts" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
  const relatedGuides = getRelatedGuides(event.typeCode);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScreenBackdrop variant="red" />
      <ScrollView contentContainerStyle={styles.page}>
        <AppButton secondary label="Back to alerts" onPress={() => navigation.goBack()} />
        <Text style={detail.kicker}>GDACS EVENT SNAPSHOT</Text>
        <Text accessibilityRole="header" style={styles.title}>{event.title || 'Hazard event'}</Text>
        <View style={detail.card}>
          <Text style={detail.heading}>{event.type || 'Hazard'} • GDACS level: {event.alertLevel || 'Not provided'}</Text>
          <Text style={detail.text}>Reported location: {event.country || 'Not provided'}</Text>
          <Text style={detail.text}>{formatAlertDistance(event.distanceKm)}</Text>
          {event.severity ? <Text style={detail.text}>Reported severity: {event.severity}</Text> : null}
          <Text style={detail.text}>Event start: {formatAlertDate(event.fromDate)}</Text>
          <Text style={detail.text}>Source last modified: {formatAlertDate(event.modifiedAt)}</Text>
          <Text style={detail.text}>Feed last fetched: {formatAlertDate(updatedAt)}</Text>
          <Text style={detail.meta}>Times use this device’s time zone. This snapshot does not update while you read it; return to Alerts and refresh for newer information.</Text>
        </View>
        <View style={detail.notice}>
          <Text style={detail.text}>An event’s distance is measured to its reported centre, not the edge of its affected area. Neither distance nor colour tells you whether you are safe. This is not an evacuation instruction.</Text>
        </View>
        <AppButton label="Open official GDACS report" onPress={() => openHelpLink(getOfficialReportUrl(event.reportUrl))} />
        <Text accessibilityRole="header" style={styles.sectionTitle}>Guidance and next steps</Text>
        <Text style={detail.text}>Check the official report and current instructions from authorities in the affected location. The learning guides below are general preparedness information, not live advice for this event.</Text>
        {relatedGuides.length === 0 && <Text style={detail.meta}>No dedicated in-app guide is available for this hazard type. Use the official report and local-authority guidance.</Text>}
        {relatedGuides.map((guide) => <AppButton key={guide.categoryId} secondary label={guide.title} onPress={() => navigation.navigate('LearnTab', { screen: 'ResourceCategory', params: { categoryId: guide.categoryId }, initial: false })} />)}
        <AppButton secondary label="Review household evacuation planning" onPress={() => navigation.navigate('LearnTab', { screen: 'ResourceCategory', params: { categoryId: 'evacuation' }, initial: false })} />
        <Text style={detail.meta}>Planning information only; this does not mean you should evacuate now.</Text>
        <AppButton label="Local help in Singapore" onPress={() => navigation.navigate('LocalHelp')} />
        <Text style={detail.meta}>Singapore contacts apply only in Singapore, even when this event is overseas.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const detail = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '700', color: '#783B34', marginTop: 18 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 18, gap: 10, marginVertical: 16 },
  heading: { fontSize: 18, fontWeight: '700', color: '#173548' },
  text: { fontSize: 16, lineHeight: 24, color: '#263C4A', marginBottom: 8 },
  meta: { fontSize: 14, lineHeight: 21, color: '#475E69', marginVertical: 8 },
  notice: { backgroundColor: '#FFF2CF', padding: 16, borderRadius: 16, marginBottom: 16 },
});
