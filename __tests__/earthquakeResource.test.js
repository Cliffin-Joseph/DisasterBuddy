import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { getResourceCategory } from '../src/data/resourceData';
import { createQuizSession, getQuiz } from '../src/data/quizData';
import ResourceCategoryScreen from '../src/screens/resourceLibrary/ResourceCategoryScreen';
import ResourceDetailScreen from '../src/screens/resourceLibrary/ResourceDetailScreen';
import { openHelpLink } from '../src/services/helpLinks';

jest.mock('../src/services/helpLinks', () => ({ openHelpLink: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

test('earthquake guides cover before, during and after with attribution', () => {
  const category = getResourceCategory('earthquake');

  expect(category.emergencyAction.steps.map((step) => step.title)).toEqual(['Drop', 'Cover', 'Hold On']);
  expect(category.articles).toHaveLength(5);
  expect(category.articles.map((article) => article.id)).toContain('earthquake-during');
  expect(category.articles.map((article) => article.id)).toContain('earthquake-after');
  for (const article of category.articles) {
    expect(article.sourceLabel).toMatch(/American Red Cross/);
    expect(article.sourceUrl).toMatch(/^https:\/\/www\.redcross\.org\//);
    expect(article.reviewedAt).toBe('2026-09-28');
  }
});

test('earthquake category shows urgent actions before its guides', () => {
  const screen = render(<ResourceCategoryScreen
    route={{ params: { categoryId: 'earthquake' } }}
    navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
  />);

  expect(screen.getByText('Shaking now? Drop, Cover, Hold On')).toBeTruthy();
  expect(screen.getByText('Prepare before shaking')).toBeTruthy();
  expect(screen.getByText('Stay safe afterward')).toBeTruthy();
});

test('earthquake guide opens its credited official source', () => {
  const screen = render(<ResourceDetailScreen
    route={{ params: { categoryId: 'earthquake', articleId: 'earthquake-after' } }}
    navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
  />);

  fireEvent.press(screen.getByText('Read original source'));
  expect(openHelpLink).toHaveBeenCalledWith(
    'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html',
  );
});

test('earthquake quiz has fifteen distinct questions and serves five', () => {
  const quiz = getQuiz('earthquake');
  const session = createQuizSession('earthquake');

  expect(quiz.questions).toHaveLength(15);
  expect(new Set(quiz.questions.map((question) => question.id)).size).toBe(15);
  expect(new Set(quiz.questions.map((question) => question.prompt)).size).toBe(15);
  expect(session.questions).toHaveLength(5);
  expect(quiz.questions.some((question) => /wheelchair/i.test(question.prompt))).toBe(true);
  expect(quiz.questions.some((question) => /coast/i.test(question.prompt))).toBe(true);
});
