import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, ScreenBackdrop } from '../../components/UIComponents';
import { localHelpCategories, singaporeHelpResources, LOCAL_HELP_REVIEWED_AT } from '../../data/localHelpData';
import { confirmHelpContact, openHelpLink } from '../../services/helpLinks';
import styles from '../../styles/styles';

function HelpCard({ resource }) {
  const isEmergency = resource.category === 'emergency';
  const contactNumber = resource.displayPhone || resource.phone || resource.sms;
  const actionLabel = resource.sms ? `SMS ${contactNumber}` : `Call ${contactNumber}`;

  return (
    <View style={[local.card, isEmergency && local.emergencyCard]}>
      <View style={local.cardHeading}>
        <View style={[local.cardMarker, isEmergency && local.emergencyMarker]} accessible={false}>
          <Text style={[local.cardMarkerText, isEmergency && local.emergencyMarkerText]}>
            {resource.sms ? 'SMS' : resource.phone ? '☎' : 'i'}
          </Text>
        </View>
        <View style={local.cardHeadingCopy}>
          <Text accessibilityRole="header" style={local.heading}>{resource.title}</Text>
          <Text style={local.organisation}>{resource.organisation}</Text>
        </View>
      </View>

      <Text style={local.description}>{resource.description}</Text>
      {contactNumber && <Text selectable style={[local.number, isEmergency && local.emergencyNumber]}>{contactNumber}</Text>}

      {(resource.phone || resource.sms) && (
        <AppButton
          label={actionLabel}
          accessibilityHint={resource.sms
            ? 'Opens your messages app. You must write and send the message.'
            : 'Opens your phone app. Confirm the call there.'}
          onPress={() => confirmHelpContact(resource)}
        />
      )}
      <AppButton
        secondary
        label="View official guidance"
        accessibilityHint={`Opens the ${resource.organisation} website. Internet is required.`}
        onPress={() => openHelpLink(resource.sourceUrl)}
      />
    </View>
  );
}

export default function LocalHelpScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScreenBackdrop variant="blue" />
      <ScrollView contentContainerStyle={styles.page}>
        <AppButton secondary label="Back" onPress={() => navigation.goBack()} />

        <View style={local.hero}>
          <Text style={local.heroEyebrow}>SINGAPORE ONLY</Text>
          <Text accessibilityRole="header" style={local.heroTitle}>Find the right help, quickly</Text>
          <Text style={local.heroText}>Choose the service that fits your situation. Calls and messages open in your phone apps for you to confirm.</Text>
        </View>

        <View style={local.warning}>
          <Text accessibilityRole="header" style={local.warningTitle}>In immediate danger?</Text>
          <Text style={local.warningText}>Use the emergency contacts below. If you are outside Singapore, contact local emergency services instead.</Text>
        </View>

        {localHelpCategories.map((category) => (
          <View key={category.id} style={local.section}>
            <Text accessibilityRole="header" style={local.sectionTitle}>{category.title}</Text>
            {singaporeHelpResources
              .filter((resource) => resource.category === category.id)
              .map((resource) => <HelpCard key={resource.id} resource={resource} />)}
          </View>
        ))}

        <View style={local.footer}>
          <Text accessibilityRole="header" style={local.footerTitle}>Before you rely on this page</Text>
          <Text style={local.footerText}>Contacts were last reviewed on {LOCAL_HELP_REVIEWED_AT}. The information is saved in the app, but it may change. Websites need internet; calls and SMS need a supported phone and service.</Text>
          <Text style={local.footerText}>Follow current instructions from Singapore authorities about where to seek safety.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  hero: { backgroundColor: '#12364C', borderRadius: 24, padding: 24, gap: 10 },
  heroEyebrow: { color: '#FFE1A1', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 35, fontWeight: '900' },
  heroText: { color: '#E5F2F7', fontSize: 16, lineHeight: 24 },
  warning: { backgroundColor: '#FFF1D1', borderColor: '#D5A436', borderWidth: 1, borderRadius: 18, padding: 18, gap: 6 },
  warningTitle: { color: '#56380C', fontSize: 19, fontWeight: '900' },
  warningText: { color: '#56380C', fontSize: 16, lineHeight: 24 },
  section: { gap: 12 },
  sectionTitle: { color: '#173548', fontSize: 22, lineHeight: 30, fontWeight: '900', marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: '#BCD4DF' },
  emergencyCard: { borderLeftWidth: 5, borderLeftColor: '#B33A34' },
  cardHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardHeadingCopy: { flex: 1, gap: 3 },
  cardMarker: { minWidth: 48, minHeight: 48, borderRadius: 12, backgroundColor: '#E2F1F7', justifyContent: 'center', alignItems: 'center', padding: 4 },
  emergencyMarker: { backgroundColor: '#FCE7E3' },
  cardMarkerText: { color: '#15506A', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  emergencyMarkerText: { color: '#8A2420' },
  heading: { color: '#173548', fontSize: 19, lineHeight: 26, fontWeight: '800' },
  organisation: { color: '#425F6B', fontSize: 14, lineHeight: 20 },
  description: { color: '#263C4A', fontSize: 16, lineHeight: 24 },
  number: { color: '#15506A', fontSize: 27, lineHeight: 34, fontWeight: '900' },
  emergencyNumber: { color: '#8A2420' },
  footer: { backgroundColor: '#EAF2F4', borderRadius: 18, padding: 18, gap: 8 },
  footerTitle: { color: '#173548', fontSize: 17, fontWeight: '800' },
  footerText: { color: '#263C4A', fontSize: 15, lineHeight: 23 },
});
