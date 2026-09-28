import { scoreQuizAnswers } from '../src/utils/quizUtils';
import { createQuizSession, getQuiz, quizzes, validateQuizCatalogue } from '../src/data/quizData';

const questions = Array.from({ length: 5 }, (_, index) => ({ id: `q${index}`, correctIndex: 1 }));
const answers = (correct) => questions.map((_, index) => ({ selectedIndex: index < correct ? 1 : 0 }));
describe('quiz scoring', () => {
  test.each([[0, 0, false], [1, 20, false], [2, 40, false], [3, 60, false], [4, 80, true], [5, 100, true]])('%i of 5 produces %i%% and pass=%s', (correct, percentage, passed) => expect(scoreQuizAnswers(questions, answers(correct))).toEqual({ score: correct, totalQuestions: 5, percentage, passed }));
  test('rejects incomplete sessions', () => expect(() => scoreQuizAnswers(questions, answers(4).slice(0, 4))).toThrow('complete'));
});

describe('quiz question selection', () => {
  test('each topic has fifteen questions and a session selects five', () => {
    expect(validateQuizCatalogue()).toBe(true);

    for (const quizId of Object.keys(quizzes)) {
      const fullQuiz = getQuiz(quizId);
      const session = createQuizSession(quizId);

      expect(fullQuiz.questions).toHaveLength(15);
      expect(session.questions).toHaveLength(5);
      expect(new Set(session.questions.map((question) => question.id)).size).toBe(5);
      expect(fullQuiz.questions).toHaveLength(15);
    }
  });

  test('mixed quiz selects five valid questions from all topics', () => {
    const session = createQuizSession('mixed');

    expect(session.questions).toHaveLength(5);
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5);
    for (const question of session.questions) {
      expect(quizzes[question.topicId].questions).toContainEqual(expect.objectContaining({ id: question.id }));
    }
  });
});
