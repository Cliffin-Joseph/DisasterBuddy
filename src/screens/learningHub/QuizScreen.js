import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createQuizSession } from '../../data/quizData';
import { useAuth } from '../../hooks/useAuth';
import { saveQuizAttempt } from '../../services/quizService';
import { AppButton, ProgressBar } from '../../components/UIComponents';
import logger from '../../services/logger';
import styles from '../../styles/styles';
import { scoreQuizAnswers } from '../../utils/quizUtils';

const QUESTIONS_PER_QUIZ = 5;

export default function QuizScreen({ route, navigation }) {
  const [quiz] = useState(() => createQuizSession(route.params.quizId));
  const { user } = useAuth();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [answerWasSubmitted, setAnswerWasSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const quizIsFinishing = useRef(false);

  if (!quiz || quiz.questions.length !== QUESTIONS_PER_QUIZ) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Quiz content is incomplete.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[questionIndex];
  const answerIsCorrect = answerWasSubmitted
    && selectedOptionIndex === currentQuestion.correctIndex;
  const isLastQuestion = questionIndex === QUESTIONS_PER_QUIZ - 1;
  const progressPercentage = ((questionIndex + 1) / QUESTIONS_PER_QUIZ) * 100;

  const continueQuiz = async () => {
    const currentAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOptionIndex,
    };
    const updatedAnswers = [...answers, currentAnswer];

    if (!isLastQuestion) {
      setAnswers(updatedAnswers);
      setQuestionIndex((currentIndex) => currentIndex + 1);
      setSelectedOptionIndex(null);
      setAnswerWasSubmitted(false);
      return;
    }

    if (quizIsFinishing.current) {
      return;
    }

    quizIsFinishing.current = true;
    const scoreDetails = scoreQuizAnswers(quiz.questions, updatedAnswers);
    const result = {
      quizId: quiz.id,
      title: quiz.title,
      questions: quiz.questions,
      ...scoreDetails,
      answers: updatedAnswers,
    };

    try {
      await saveQuizAttempt(user?.uid, result);
    } catch (error) {
      logger.warn('quiz_attempt_save_failed', error, {
        uid: user?.uid,
        quizId: quiz.id,
      });
    } finally {
      navigation.replace('QuizResult', { result });
    }
  };

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Exit quiz" accessibilityHint="Returns to quiz categories" onPress={() => navigation.goBack()} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.back}>‹ Exit quiz</Text></Pressable>
    <Text style={styles.eyebrow}>QUESTION {questionIndex + 1} OF {QUESTIONS_PER_QUIZ}</Text><Text style={styles.title}>{quiz.title}</Text><ProgressBar value={progressPercentage} />
    <Text accessibilityRole="header" style={styles.quizQuestion}>{currentQuestion.prompt}</Text>
    {currentQuestion.options.map((option, optionIndex) => {
      const optionIsSelected = selectedOptionIndex === optionIndex;
      const optionIsCorrect = answerWasSubmitted
        && optionIndex === currentQuestion.correctIndex;
      const optionIsIncorrect = answerWasSubmitted
        && optionIsSelected
        && !optionIsCorrect;

      return <Pressable key={option} accessibilityRole="radio" accessibilityLabel={`Option ${String.fromCharCode(65 + optionIndex)}. ${option}`} accessibilityState={{ selected: optionIsSelected, disabled: answerWasSubmitted }} disabled={answerWasSubmitted} onPress={() => setSelectedOptionIndex(optionIndex)} style={[styles.quizOption, optionIsSelected && styles.quizOptionSelected, optionIsCorrect && styles.quizOptionCorrect, optionIsIncorrect && styles.quizOptionIncorrect]}><View style={styles.quizOptionMarker} accessible={false}><Text style={styles.quizOptionMarkerText}>{String.fromCharCode(65 + optionIndex)}</Text></View><Text style={styles.quizOptionText}>{option}</Text></Pressable>;
    })}
    {answerWasSubmitted && <View accessibilityRole="alert" style={[styles.feedbackCard, answerIsCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}><Text style={styles.feedbackTitle}>{answerIsCorrect ? 'Correct' : 'Not quite'}</Text><Text style={styles.feedbackText}>{currentQuestion.explanation}</Text></View>}
    {!answerWasSubmitted ? <AppButton label="Check answer" disabled={selectedOptionIndex === null} onPress={() => setAnswerWasSubmitted(true)} /> : <AppButton label={isLastQuestion ? 'View result' : 'Next question'} onPress={continueQuiz} />}
  </ScrollView></SafeAreaView>;
}
