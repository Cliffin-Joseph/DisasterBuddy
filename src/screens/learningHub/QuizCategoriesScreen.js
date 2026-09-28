import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackdrop } from '../../components/UIComponents';
import { resourceCategories, resourceIconUrls } from '../../data/resourceData';
import styles from '../../styles/styles';

function getCategoryTileStyle(index) {
  const colorPosition = index % 3;

  if (colorPosition === 1) {
    return styles.quizCategoryTileOrange;
  }

  if (colorPosition === 2) {
    return styles.quizCategoryTilePurple;
  }

  return null;
}

export default function QuizCategoriesScreen({ navigation }) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScreenBackdrop variant="purple" /><ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Learning Hub</Text></Pressable>
    <View style={styles.quizHero}><Text style={styles.quizHeroKicker}>5 QUESTIONS · RANDOMISED</Text><Text style={styles.quizHeroTitle}>Choose your challenge</Text><Text style={styles.quizHeroText}>Build mastery, earn points, and discover topics worth reviewing.</Text></View>
    <Pressable onPress={() => navigation.navigate('Quiz', { quizId: 'mixed' })} style={styles.mixedQuizFeature}><View style={styles.mixedQuizIconLarge}><Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3407/3407038.png' }} style={styles.mixedQuizImage} /></View><View style={{ flex: 1 }}><Text style={styles.mixedQuizLabel}>MIXED TOPICS</Text><Text style={styles.mixedQuizFeatureTitle}>Emergency readiness mix</Text><Text style={styles.mixedQuizFeatureText}>Questions selected from every safety category.</Text></View><Text style={styles.quizEntryArrow}>›</Text></Pressable>
    <Text style={styles.sectionTitle}>Topic quizzes</Text>
    <View style={styles.quizCategoryGrid}>
      {resourceCategories.map((category, index) => {
        const tileColorStyle = getCategoryTileStyle(index);

        return (
          <Pressable
            key={category.id}
            onPress={() => navigation.navigate('Quiz', { quizId: category.id })}
            style={[styles.quizCategoryTile, tileColorStyle]}
          >
            <Image
              source={{ uri: resourceIconUrls[category.id] }}
              style={styles.quizCategoryImage}
            />
            <Text style={styles.quizCategoryTitle}>{category.title}</Text>
            <Text style={styles.quizCategoryMeta}>15 question bank</Text>
            <View style={styles.quizCategoryCta}>
              <Text style={styles.quizCategoryCtaText}>Start</Text>
              <Text style={styles.quizCategoryCtaArrow}>›</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  </ScrollView></SafeAreaView>;
}
