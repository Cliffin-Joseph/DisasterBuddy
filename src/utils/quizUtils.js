export function scoreQuizAnswers(questions, answers, passPercentage = 70) {
  const questionsAreInvalid = !Array.isArray(questions) || questions.length === 0;
  const answersAreInvalid = !Array.isArray(answers) || answers.length !== questions?.length;

  if (questionsAreInvalid || answersAreInvalid) {
    throw new Error('Quiz questions and answers must be complete.');
  }

  let score = 0;

  for (let index = 0; index < answers.length; index += 1) {
    const answer = answers[index];
    const question = questions[index];
    if (answer?.selectedIndex === question?.correctIndex) {
      score += 1;
    }
  }

  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  return {
    score,
    totalQuestions,
    percentage,
    passed: percentage >= passPercentage,
  };
}
