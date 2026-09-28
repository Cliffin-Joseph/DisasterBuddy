import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/UIComponents';
import styles from '../../styles/styles';

export default function QuizResultScreen({ route, navigation }) {
  const { result } = route.params;
  const questions = result.questions ?? [];
  const resultTitle = result.passed ? 'Passed' : 'Keep learning';
  const resultMessage = result.passed
    ? 'You met the 4/5 pass requirement.'
    : 'Review the explanations and try again when ready.';

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.eyebrow}>QUIZ RESULT</Text><Text style={styles.title}>{resultTitle}</Text>
    <View style={[styles.quizScoreCard, result.passed && styles.quizScoreCardPassed]}><Text style={styles.quizScore}>{result.score}/{result.totalQuestions}</Text><Text style={styles.quizPercentage}>{result.percentage}%</Text><Text style={styles.muted}>{resultMessage}</Text></View>
    <Text style={styles.sectionTitle}>Answer review</Text>
    {questions.map((question, index) => {
      const answer = result.answers[index];
      const answerIsCorrect = answer.selectedIndex === question.correctIndex;
      const selectedAnswerText = question.options[answer.selectedIndex];

      return (
        <View key={question.id} style={styles.answerReview}>
          <Text style={styles.answerReviewState}>
            {answerIsCorrect ? '✓' : '×'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.answerReviewQuestion}>{question.prompt}</Text>
            {!answerIsCorrect ? (
              <Text style={styles.answerReviewSelected}>
                Your answer: {selectedAnswerText}
              </Text>
            ) : null}
            <Text style={styles.answerReviewExplanation}>
              {question.explanation}
            </Text>
          </View>
        </View>
      );
    })}
    <AppButton label="Retry quiz" onPress={() => navigation.replace('Quiz', { quizId: result.quizId })} /><AppButton label="Return to resources" secondary onPress={() => navigation.popToTop()} />
  </ScrollView></SafeAreaView>;
}
