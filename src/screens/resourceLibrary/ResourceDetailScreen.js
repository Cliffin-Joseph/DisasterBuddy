import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/UIComponents';
import { resourceCategories } from '../../data/resourceData';
import { openHelpLink } from '../../services/helpLinks';
import styles from '../../styles/styles';

export default function ResourceDetailScreen({ route, navigation }) {
  const { categoryId, articleId } = route.params;
  const category = resourceCategories.find((candidateCategory) => (
    candidateCategory.id === categoryId
  ));
  const article = category?.articles.find((candidateArticle) => (
    candidateArticle.id === articleId
  ));

  if (!article) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <Text>Resource article not found.</Text>
      </SafeAreaView>
    );
  }

  const estimatedReadingMinutes = Math.max(2, article.content.length);

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.articlePage}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ {category.title}</Text></Pressable>
    <View style={styles.articleHero}><Text style={styles.articleHeroKicker}>PRACTICAL SAFETY GUIDE</Text><Text style={styles.articleHeroTitle}>{article.title}</Text><Text style={styles.articleHeroSummary}>{article.summary}</Text><View style={styles.articleReadPill}><Text style={styles.articleReadPillText}>{estimatedReadingMinutes} min read</Text></View></View>
    <View style={styles.articleSectionHeader}><Text style={styles.articleSectionKicker}>WHAT TO REMEMBER</Text><Text style={styles.articleSectionTitle}>Actions that make a difference</Text></View>
    {article.content.map((paragraph, index) => {
      const useAlternateStyle = index % 2 === 1;

      return <View key={`${article.id}-${index}`} style={[styles.guidanceStep, useAlternateStyle && styles.guidanceStepAlt]}><View style={[styles.guidanceStepNumber, useAlternateStyle && styles.guidanceStepNumberAlt]}><Text style={styles.guidanceStepNumberText}>{index + 1}</Text></View><Text style={styles.guidanceStepText}>{paragraph}</Text></View>;
    })}
    <View style={styles.articleWarning}><View style={styles.articleWarningIcon}><Text style={styles.articleWarningIconText}>!</Text></View><View style={{ flex: 1 }}><Text style={styles.articleWarningTitle}>Official advice comes first</Text><Text style={styles.articleWarningText}>Always follow current instructions issued by local authorities and emergency services.</Text></View></View>
    <View style={styles.articleSource}><Text style={styles.articleSourceKicker}>SOURCE & REVIEW</Text><Text style={styles.articleSourceText}>{article.sourceLabel}</Text><Text style={styles.articleSourceDate}>Reviewed {article.reviewedAt}</Text></View>
    {article.sourceUrl && <AppButton secondary label="Read original source" accessibilityHint="Opens the American Red Cross website. Internet is required." onPress={() => openHelpLink(article.sourceUrl)} />}
    <AppButton label="Take the related quiz" onPress={() => navigation.navigate('Quiz', { quizId: category.id })} />
  </ScrollView></SafeAreaView>;
}
