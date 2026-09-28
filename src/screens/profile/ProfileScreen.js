import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, ProgressBar, ScreenBackdrop } from '../../components/UIComponents';
import { useAuth } from '../../hooks/useAuth';
import { loadProfile, loadProfilePhoto, removeEmergencyContact, saveEmergencyContact, saveProfile, saveProfilePhoto } from '../../services/profileService';
import { uploadProfileImage } from '../../services/profileImageService';
import logger from '../../services/logger';
import styles from '../../styles/styles';

const EMPTY_PROFILE = {
  displayName: '',
  phone: '',
  householdSize: '',
  homeArea: '',
  accessibilityNeeds: '',
  pets: '',
  householdNotes: '',
};

const EMPTY_CONTACT = {
  id: '',
  name: '',
  relationship: '',
  phone: '',
  email: '',
  notes: '',
};

const PROFILE_TABS = [
  { key: 'personal', label: 'Personal' },
  { key: 'household', label: 'Household' },
  { key: 'contacts', label: 'Contacts' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [activeTab, setActiveTab] = useState('personal');
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const applyLoadedProfileData = useCallback((loadedData) => {
    const loadedProfile = loadedData.profile ?? {};
    const displayName = loadedProfile.displayName || user.displayName || '';
    const householdSize = loadedProfile.householdSize?.toString() ?? '';

    setProfile({
      ...EMPTY_PROFILE,
      ...loadedProfile,
      displayName,
      householdSize,
    });
    setContacts(loadedData.contacts ?? []);

    if (loadedProfile.photoURL) {
      setPhotoUri(loadedProfile.photoURL);
    }

    setLoading(false);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    setRefreshing(true);

    try {
      const loadedData = await loadProfile(user.uid, applyLoadedProfileData);
      applyLoadedProfileData(loadedData);
    } catch (error) {
      logger.warn('profile_refresh_failed', error, { uid: user.uid });

      if (loading) {
        Alert.alert(
          'Could not refresh profile',
          'Your cached details will remain available.',
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, applyLoadedProfileData, loading]);

  useEffect(() => {
    refreshProfile();

    loadProfilePhoto(user.uid)
      .then((savedPhotoUri) => {
        if (savedPhotoUri) {
          setPhotoUri(savedPhotoUri);
        }
      })
      .catch((error) => {
        logger.warn('local_profile_photo_load_failed', error, { uid: user.uid });
      });
  }, [user.uid]);

  const completionPercentage = useMemo(() => {
    const completedProfileAreas = [
      profile.displayName,
      profile.phone,
      profile.householdSize,
      profile.homeArea,
      profile.accessibilityNeeds || profile.householdNotes,
      contacts.length > 0,
    ];
    const completedCount = completedProfileAreas.filter(Boolean).length;
    return Math.round((completedCount / completedProfileAreas.length) * 100);
  }, [profile, contacts]);

  const nameForInitials = profile.displayName || user.email || 'DB';
  const initials = nameForInitials
    .split(/\s+/)
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function updateProfileField(fieldName, value) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [fieldName]: value,
    }));
  }

  function updateContactField(fieldName, value) {
    setContact((currentContact) => ({
      ...currentContact,
      [fieldName]: value,
    }));
  }

  const saveDetails = async () => {
    if (!profile.displayName.trim()) {
      Alert.alert('Name required', 'Enter the name DisasterBuddy should use for you.');
      return;
    }

    setSaving(true);

    try {
      await saveProfile(user.uid, profile);
      Alert.alert('Saved', 'Your profile is up to date.');
    } catch (error) {
      logger.error('profile_save_failed', error, { uid: user.uid });
      Alert.alert('Could not save profile', error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    if (!contact.name.trim() || !contact.phone.trim()) {
      Alert.alert('Contact incomplete', 'Enter at least a name and phone number.');
      return;
    }

    setSaving(true);

    try {
      await saveEmergencyContact(user.uid, contact);
      setContact(EMPTY_CONTACT);
      setShowContactForm(false);
      await refreshProfile();
    } catch (error) {
      logger.error('emergency_contact_save_failed', error, { uid: user.uid });
      Alert.alert('Could not save contact', error.message);
    } finally {
      setSaving(false);
    }
  };

  const editContact = (selectedContact) => {
    setContact({ ...EMPTY_CONTACT, ...selectedContact });
    setShowContactForm(true);
  };
  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo-library access to choose a profile picture.',
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    const selectedPhoto = pickerResult.assets?.[0];

    if (pickerResult.canceled || !selectedPhoto?.uri) {
      return;
    }

    setUploadingPhoto(true);

    try {
      const localPhotoUri = await saveProfilePhoto(user.uid, selectedPhoto.uri);
      setPhotoUri(localPhotoUri);

      const cloudPhotoUrl = await uploadProfileImage(user.uid, {
        ...selectedPhoto,
        uri: localPhotoUri,
      });
      setPhotoUri(cloudPhotoUrl);
    } catch (error) {
      Alert.alert(
        'Photo saved on this device',
        `Cloud upload did not finish. ${error.message}`,
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deleteContact = (selectedContact) => {
    Alert.alert(
      'Remove emergency contact?',
      `${selectedContact.name} will be removed from your list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEmergencyContact(user.uid, selectedContact.id);
              setContacts((currentContacts) => (
                currentContacts.filter((entry) => entry.id !== selectedContact.id)
              ));
            } catch (error) {
              logger.error('emergency_contact_remove_failed', error, { uid: user.uid });
              Alert.alert('Could not remove contact', error.message);
            }
          },
        },
      ],
    );
  };

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScreenBackdrop variant="purple" /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      <View style={styles.profileHero}><Pressable disabled={uploadingPhoto} accessibilityRole="button" accessibilityLabel="Choose profile picture" onPress={choosePhoto} style={styles.avatar}>{photoUri ? <Image source={{ uri: photoUri }} style={styles.profilePhoto} /> : <Text style={styles.avatarText}>{initials}</Text>}<View style={styles.photoEditBadge}><Text style={styles.photoEditText}>+</Text></View></Pressable><View style={{ flex: 1 }}><Text style={styles.profileHeroName}>{profile.displayName || 'Your profile'}</Text><Text numberOfLines={1} style={styles.profileHeroEmail}>{user.email}</Text><Text style={styles.changePhotoText}>{uploadingPhoto ? 'Uploading securely…' : 'Tap photo to change'}</Text></View><View style={styles.profilePercent}><Text style={styles.profilePercentText}>{completionPercentage}%</Text></View></View>
      <View style={styles.profileCompletion}><View style={styles.profileCompletionRow}><Text style={styles.cardTitle}>Preparedness profile</Text><Text style={styles.profileCompletionLabel}>{completionPercentage === 100 ? 'Complete' : 'Keep building'}</Text></View><ProgressBar value={completionPercentage} /><Text style={styles.muted}>Complete your details so plans and future recommendations can better reflect your household.</Text></View>
      <View accessibilityRole="tablist" style={styles.profileTabs}>{PROFILE_TABS.map((tab) => <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab.key }} onPress={() => setActiveTab(tab.key)} style={[styles.profileTab, activeTab === tab.key && styles.profileTabActive]}><Text style={[styles.profileTabText, activeTab === tab.key && styles.profileTabTextActive]}>{tab.label}{tab.key === 'contacts' ? ` (${contacts.length})` : ''}</Text></Pressable>)}</View>
      {loading ? <View style={styles.profileSection}><Text style={styles.muted}>Loading your profile…</Text></View> : <>
        {activeTab === 'personal' && <View style={styles.profileSection}><SectionHeading icon="P" title="Personal details" subtitle="How DisasterBuddy identifies and contacts you." /><ProfileField label="Display name" value={profile.displayName} onChangeText={(value) => updateProfileField('displayName', value)} /><ProfileField label="Email" value={user.email ?? ''} editable={false} help="Managed by your Firebase account." /><ProfileField label="Phone number (optional)" value={profile.phone} onChangeText={(value) => updateProfileField('phone', value)} keyboardType="phone-pad" /><AppButton label={saving ? 'Saving…' : 'Save personal details'} disabled={saving} onPress={saveDetails} /></View>}
        {activeTab === 'household' && <View style={styles.profileSection}><SectionHeading icon="H" title="Household needs" subtitle="Useful context for preparing a realistic emergency plan." /><ProfileField label="Household members" value={profile.householdSize} onChangeText={(value) => updateProfileField('householdSize', value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" /><ProfileField label="Home area (optional)" value={profile.homeArea} onChangeText={(value) => updateProfileField('homeArea', value)} help="Use a neighbourhood or district, not a precise address." /><ProfileField label="Accessibility or medical considerations" value={profile.accessibilityNeeds} onChangeText={(value) => updateProfileField('accessibilityNeeds', value)} multiline placeholder="Mobility, medication, communication or care needs…" /><ProfileField label="Pets and their needs" value={profile.pets} onChangeText={(value) => updateProfileField('pets', value)} multiline /><ProfileField label="Other household notes" value={profile.householdNotes} onChangeText={(value) => updateProfileField('householdNotes', value)} multiline /><AppButton label={saving ? 'Saving…' : 'Save household details'} disabled={saving} onPress={saveDetails} /></View>}
        {activeTab === 'contacts' && <View style={styles.profileSection}><SectionHeading icon="SOS" title="Emergency contacts" subtitle="Trusted people and services you may need quickly." />{contacts.length === 0 ? <View style={styles.emptyInventory}><Text style={styles.muted}>No emergency contacts yet. Add someone you trust.</Text></View> : contacts.map((item) => <View key={item.id} style={styles.contactCard}><View style={styles.contactAvatar}><Text style={styles.contactAvatarText}>{item.name.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.contactRelationship}>{item.relationship || 'Emergency contact'}</Text><Text style={styles.muted}>{item.phone}{item.email ? ` · ${item.email}` : ''}</Text></View><View style={styles.contactActions}><Pressable onPress={() => editContact(item)}><Text style={styles.inventoryAction}>Edit</Text></Pressable><Pressable onPress={() => deleteContact(item)}><Text style={styles.inventoryDelete}>Remove</Text></Pressable></View></View>)}{!showContactForm ? <AppButton label="Add emergency contact" onPress={() => { setContact(EMPTY_CONTACT); setShowContactForm(true); }} /> : <View style={styles.contactEditor}><View style={styles.profileCompletionRow}><Text style={styles.cardTitle}>{contact.id ? 'Edit contact' : 'New contact'}</Text><Pressable onPress={() => { setContact(EMPTY_CONTACT); setShowContactForm(false); }}><Text style={styles.back}>Cancel</Text></Pressable></View><ProfileField label="Name" value={contact.name} onChangeText={(value) => updateContactField('name', value)} /><ProfileField label="Relationship" value={contact.relationship} onChangeText={(value) => updateContactField('relationship', value)} placeholder="Family, neighbour, doctor…" /><ProfileField label="Phone" value={contact.phone} onChangeText={(value) => updateContactField('phone', value)} keyboardType="phone-pad" /><ProfileField label="Email (optional)" value={contact.email} onChangeText={(value) => updateContactField('email', value)} keyboardType="email-address" autoCapitalize="none" /><ProfileField label="Notes (optional)" value={contact.notes} onChangeText={(value) => updateContactField('notes', value)} multiline /><AppButton label={saving ? 'Saving…' : contact.id ? 'Update contact' : 'Save contact'} disabled={saving} onPress={saveContact} /></View>}</View>}
      </>}
      {refreshing && !loading ? <Text style={styles.cacheStatus}>Refreshing securely from Firebase…</Text> : null}
      <View style={styles.accountActions}><Text style={styles.cardTitle}>Account</Text><AppButton secondary label="Log out" onPress={() => Alert.alert('Log out?', 'You will need your email and password to return.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }])} /></View>
      <Text style={styles.iconAttribution}>Navigation icons provided by Flaticon.</Text>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingIcon}>
        <Text style={styles.sectionHeadingIconText}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
    </View>
  );
}

function ProfileField({ label, help, multiline = false, ...textInputProps }) {
  const inputIsDisabled = textInputProps.editable === false;
  const verticalAlignment = multiline ? 'top' : 'center';

  return (
    <View style={{ gap: 5 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8B9991"
        style={[
          styles.input,
          multiline && styles.multilineInput,
          inputIsDisabled && styles.inputDisabled,
        ]}
        multiline={multiline}
        textAlignVertical={verticalAlignment}
        {...textInputProps}
      />
      {help ? <Text style={styles.fieldHelp}>{help}</Text> : null}
    </View>
  );
}
