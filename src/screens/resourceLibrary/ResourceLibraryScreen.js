import React from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, ScreenBackdrop } from '../../components/UIComponents';
import { resourceCategories, resourceIconUrls } from '../../data/resourceData';
import styles from '../../styles/styles';

const CATEGORY_CARD_TONES = [
  styles.learningCardBlue,
  styles.learningCardOrange,
  styles.learningCardPurple,
  styles.learningCardYellow,
];

export default function ResourceLibraryScreen({ navigation }) {
  const { fontScale } = useWindowDimensions();
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScreenBackdrop variant="blue" /><ScrollView contentContainerStyle={styles.page}>
    <View style={styles.learningHero}><View style={{ flex: 1 }}><Text style={styles.learningHeroEyebrow}>RESOURCE HUB</Text><Text style={styles.learningHeroTitle}>Learn before it matters</Text><Text style={styles.learningHeroText}>Short, practical safety guidance designed for quick reading and offline review.</Text></View><View style={styles.learningHeroArt}><Text style={styles.learningHeroArtText}>i</Text></View></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Take a short quiz. Five random questions." onPress={() => navigation.navigate('QuizCategories')} style={styles.quizEntryCard}><View style={styles.quizEntryIcon} accessible={false}><Image accessible={false} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3407/3407038.png' }} style={styles.featureImageIconLight} /></View><View style={{ flex: 1 }}><Text style={styles.quizEntryLabel}>QUICK CHALLENGE</Text><Text style={styles.quizEntryTitle}>Test your emergency knowledge</Text><Text style={styles.quizEntryText}>Five random questions · earn points and mastery</Text></View><Text style={styles.quizEntryArrow}>›</Text></Pressable>
    <AppButton label="Local help in Singapore" onPress={() => navigation.navigate('LocalHelp')} />
    <View style={styles.sectionHeadingRow}><View><Text accessibilityRole="header" style={styles.sectionTitle}>Explore safety topics</Text><Text style={styles.muted}>Choose what you want to prepare for</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Quiz history" onPress={() => navigation.navigate('QuizHistory')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.inventoryAction}>Quiz history</Text></Pressable></View>
    <View style={styles.learningGrid}>
      {resourceCategories.map((category, index) => {
        const toneIndex = index % CATEGORY_CARD_TONES.length;
        const cardTone = CATEGORY_CARD_TONES[toneIndex];

        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={`${category.title}. ${category.description}`}
            onPress={() => navigation.navigate('ResourceCategory', {
              categoryId: category.id,
            })}
            style={[styles.learningCategoryCard, cardTone, fontScale >= 1.3 && { width: '100%' }]}
          >
            <View style={styles.learningCategoryIcon}>
              <Image
                accessible={false}
                source={{ uri: resourceIconUrls[category.id] }}
                style={styles.learningCategoryImage}
              />
            </View>
            <Text style={styles.learningCategoryTitle}>{category.title}</Text>
            <Text style={styles.learningCategoryDescription}>
              {category.description}
            </Text>
            <Text style={styles.learningCategoryOpen}>Explore ›</Text>
          </Pressable>
        );
      })}
    </View>
    <View style={styles.learningSafetyNote}><Text style={styles.learningSafetyIcon}>!</Text><Text style={styles.learningSafetyText}>During an emergency, always follow current instructions from official authorities.</Text></View>
  </ScrollView></SafeAreaView>;
}
