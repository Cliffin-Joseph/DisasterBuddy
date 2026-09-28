import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resourceCategories, resourceIconUrls } from '../../data/resourceData';
import styles from '../../styles/styles';

export default function ResourceCategoryScreen({ route, navigation }) {
  const requestedCategoryId = route.params.categoryId;
  const category = resourceCategories.find((candidateCategory) => (
    candidateCategory.id === requestedCategoryId
  ));

  if (!category) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <Text>Resource category not found.</Text>
      </SafeAreaView>
    );
  }

  const guideCountLabel = category.articles.length === 1
    ? '1 quick guide'
    : `${category.articles.length} quick guides`;

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ All topics</Text></Pressable>
    <View style={styles.categoryHero}><View style={styles.categoryHeroIcon}><Image source={{ uri: resourceIconUrls[category.id] }} style={styles.categoryHeroImage} /></View><Text style={styles.categoryHeroKicker}>SAFETY GUIDE</Text><Text style={styles.categoryHeroTitle}>{category.title}</Text><Text style={styles.categoryHeroText}>{category.description}</Text><View style={styles.categoryHeroMeta}><Text style={styles.categoryMetaPill}>{guideCountLabel}</Text><Text style={styles.categoryMetaPill}>Available offline</Text></View></View>
    {category.emergencyAction && (
      <View style={earthquake.emergencyCard}>
        <Text style={earthquake.emergencyEyebrow}>IF SHAKING IS HAPPENING NOW</Text>
        <Text accessibilityRole="header" style={earthquake.emergencyTitle}>{category.emergencyAction.title}</Text>
        {category.emergencyAction.steps.map((step, index) => (
          <View key={step.title} style={earthquake.actionStep}>
            <Text style={earthquake.stepNumber}>{index + 1}</Text>
            <View style={earthquake.stepCopy}>
              <Text style={earthquake.stepTitle}>{step.title}</Text>
              <Text style={earthquake.stepDetail}>{step.detail}</Text>
            </View>
          </View>
        ))}
        <Text style={earthquake.emergencyNote}>Follow current instructions from local emergency services.</Text>
      </View>
    )}
    <Pressable onPress={() => navigation.navigate('Quiz', { quizId: category.id })} style={styles.categoryQuizBanner}><View><Text style={styles.categoryQuizKicker}>KNOWLEDGE CHECK</Text><Text style={styles.categoryQuizTitle}>Take the 5-question quiz</Text><Text style={styles.categoryQuizText}>Earn points and improve topic mastery.</Text></View><Text style={styles.categoryQuizArrow}>›</Text></Pressable>
    <Text style={styles.sectionTitle}>Guides in this topic</Text>
    {category.articles.map((article, index) => {
      const articleNumber = String(index + 1).padStart(2, '0');

      return <Pressable key={article.id} onPress={() => navigation.navigate('ResourceDetail', { categoryId: category.id, articleId: article.id })} style={styles.articlePreviewCard}><View style={styles.articlePreviewNumber}><Text style={styles.articlePreviewNumberText}>{articleNumber}</Text></View><View style={{ flex: 1 }}><Text style={styles.articlePreviewLabel}>QUICK READ</Text><Text style={styles.articlePreviewTitle}>{article.title}</Text><Text style={styles.articlePreviewSummary}>{article.summary}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
    })}
  </ScrollView></SafeAreaView>;
}

const earthquake = StyleSheet.create({
  emergencyCard: { backgroundColor: '#17374A', borderRadius: 22, padding: 20, gap: 12 },
  emergencyEyebrow: { color: '#FFE0A3', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  emergencyTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 29, fontWeight: '900' },
  actionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { color: '#17374A', backgroundColor: '#FFE0A3', width: 32, height: 32, borderRadius: 16, textAlign: 'center', textAlignVertical: 'center', lineHeight: 32, fontWeight: '900' },
  stepCopy: { flex: 1 },
  stepTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  stepDetail: { color: '#E7F1F6', fontSize: 15, lineHeight: 22 },
  emergencyNote: { color: '#E7F1F6', fontSize: 14, lineHeight: 21, borderTopWidth: 1, borderTopColor: '#78929F', paddingTop: 12 },
});
