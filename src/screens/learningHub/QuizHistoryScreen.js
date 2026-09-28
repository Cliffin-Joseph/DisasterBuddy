import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { loadQuizAttempts } from '../../services/quizService';
import logger from '../../services/logger';
import styles from '../../styles/styles';

export default function QuizHistoryScreen() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let screenIsActive = true;

    function displayCachedAttempts(cachedAttempts) {
      if (screenIsActive) {
        setAttempts(cachedAttempts);
        setLoading(false);
      }
    }

    async function loadHistory() {
      try {
        const loadedAttempts = await loadQuizAttempts(
          user?.uid,
          displayCachedAttempts,
        );

        if (screenIsActive) {
          setAttempts(loadedAttempts);
        }
      } catch (error) {
        logger.warn('quiz_history_load_failed', error, { uid: user?.uid });
      } finally {
        if (screenIsActive) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      screenIsActive = false;
    };
  }, [user?.uid]);

  let historyContent;
  if (loading && attempts.length === 0) {
    historyContent = <Text style={styles.muted}>Loading quiz history…</Text>;
  } else if (attempts.length === 0) {
    historyContent = (
      <View style={styles.emptyInventory}>
        <Text style={styles.muted}>No completed quiz attempts yet.</Text>
      </View>
    );
  } else {
    historyContent = attempts.map((attempt) => {
      const quizTitle = attempt.quizId.replaceAll('-', ' ');
      const completedDate = attempt.completedAt
        ? new Date(attempt.completedAt).toLocaleDateString()
        : 'Recently completed';

      return (
        <View key={attempt.id} style={styles.historyCard}>
          <View>
            <Text style={styles.cardTitle}>{quizTitle}</Text>
            <Text style={styles.muted}>{completedDate}</Text>
          </View>
          <View>
            <Text style={styles.historyScore}>
              {attempt.score}/{attempt.totalQuestions}
            </Text>
            <Text style={[
              styles.historyStatus,
              attempt.passed && styles.historyPassed,
            ]}>
              {attempt.passed ? 'Passed' : 'Not passed'}
            </Text>
          </View>
        </View>
      );
    });
  }

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.eyebrow}>LEARNING</Text><Text style={styles.title}>Quiz history</Text>
    {historyContent}
  </ScrollView></SafeAreaView>;
}
