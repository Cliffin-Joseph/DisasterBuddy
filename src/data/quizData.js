const q = (id, prompt, options, correctIndex, explanation) => ({ id, prompt, options, correctIndex, explanation });

// Most topics expand five starting questions. Earthquake has fifteen distinct questions.
const startingQuestionsByTopic = {
  fire: [
    q('fire-1', 'What should you do first after discovering a fire that cannot be safely controlled?', ['Hide in another room', 'Alert others and leave safely', 'Use the lift', 'Return for belongings'], 1, 'Alert others, evacuate by a safe route, and contact emergency services from safety.'),
    q('fire-2', 'Which route should normally be avoided during a building fire?', ['A safe stairway', 'A designated exit', 'A lift', 'A clear escape route'], 2, 'Lifts may fail or open into danger during a fire.'),
    q('fire-3', 'When is it safe to re-enter after evacuation?', ['When you remember an item', 'After five minutes', 'When authorities say it is safe', 'When smoke looks lighter'], 2, 'Conditions can remain dangerous even when they appear calmer.'),
    q('fire-4', 'What improves evacuation readiness?', ['Blocked corridors', 'Clear exits and a discussed route', 'Locked emergency exits', 'Unfamiliar meeting points'], 1, 'Clear routes and a shared plan reduce delay.'),
    q('fire-5', 'Where should an emergency call be made from?', ['Inside the hazard area', 'From a safe location', 'Inside a lift', 'Only after returning home'], 1, 'Move to safety before calling when possible.'),
  ],
  flood: [
    q('flood-1', 'What is the safest response to a flooded roadway?', ['Drive through slowly', 'Avoid it and use a safe route', 'Follow another vehicle', 'Walk through first'], 1, 'Depth, current, and hidden hazards are difficult to judge.'),
    q('flood-2', 'Where should important document copies be kept?', ['Unprotected on the floor', 'In protected, accessible storage', 'Beside an open window', 'Inside floodwater'], 1, 'Protected storage improves recovery without increasing exposure.'),
    q('flood-3', 'What information should guide action during intense rain?', ['Old screenshots', 'Current official advisories', 'Anonymous rumours', 'Unverified messages'], 1, 'Conditions change; current official guidance is the appropriate source.'),
    q('flood-4', 'What should you do when instructed to move to higher ground?', ['Delay unnecessarily', 'Follow the instruction promptly', 'Enter floodwater', 'Wait for social media consensus'], 1, 'Prompt action may prevent routes becoming unsafe.'),
    q('flood-5', 'How should water-exposed electrical equipment be treated?', ['Use it immediately', 'Avoid it and seek qualified advice', 'Dry it with an open flame', 'Touch it while standing in water'], 1, 'Water exposure can create serious electrical hazards.'),
  ],
  earthquake: [
    q('earthquake-1', 'What should you do when strong shaking begins indoors?', ['Run to the street', 'Drop, Cover and Hold On', 'Stand beside a window', 'Use a lift'], 1, 'Get low, protect your head and neck, and stay sheltered until shaking stops.'),
    q('earthquake-2', 'Why do you drop onto your hands and knees?', ['To move quickly across the building', 'To avoid being knocked down and reach nearby cover', 'To inspect the floor', 'To find your phone'], 1, 'Getting low reduces the chance of falling and lets you reach close shelter.'),
    q('earthquake-3', 'A sturdy table is close to you. What should you do?', ['Crawl underneath and hold on', 'Stand on top of it', 'Move it to another room', 'Ignore it and run outside'], 0, 'A nearby sturdy table can protect you from falling objects; hold it as it may move.'),
    q('earthquake-4', 'What should you protect if no sturdy shelter is nearby?', ['Only your feet', 'Your phone', 'Your head and neck', 'Your belongings'], 2, 'Use your arms to protect your head and neck and stay away from windows if safely possible.'),
    q('earthquake-5', 'Shaking starts while you are in bed. What is the safer action?', ['Stay in bed and cover your head with a pillow', 'Run barefoot outside', 'Stand beside a window', 'Hide under the mattress'], 0, 'Staying in bed and using a pillow protects you until the shaking stops.'),
    q('earthquake-6', 'Where should you move if you are outdoors during shaking?', ['Next to a building', 'Under electrical wires', 'Toward open space if you can do so safely', 'Beside a large tree'], 2, 'Stay clear of structures, trees and wires that could fall.'),
    q('earthquake-7', 'What should a driver do during strong shaking?', ['Speed up', 'Stop in a safe place and remain in the vehicle', 'Stop beneath an overpass', 'Cross a bridge immediately'], 1, 'Pull over away from hazards and stay inside until the shaking stops.'),
    q('earthquake-8', 'What should someone using a wheelchair or walker do?', ['Leave the equipment and run', 'Lock the wheels, remain seated and protect the head and neck', 'Move beneath a window', 'Wait for someone else before taking cover'], 1, 'Locking the wheels and bracing helps when dropping to the ground is not possible.'),
    q('earthquake-9', 'What is a useful way to reduce injury risk before an earthquake?', ['Leave heavy shelves unsecured', 'Secure heavy and breakable items', 'Block exit routes', 'Store glass above the bed'], 1, 'Securing items reduces the chance they fall during shaking.'),
    q('earthquake-10', 'Can an earthquake early-warning system predict an earthquake?', ['Yes, days ahead', 'Yes, months ahead', 'No; it may warn briefly after one has started', 'Yes, if a phone is charged'], 2, 'Early warning is not prediction; it may give seconds of notice before strong shaking reaches you.'),
    q('earthquake-11', 'What should you expect after the first earthquake?', ['No further shaking', 'Possible aftershocks that require Drop, Cover and Hold On again', 'An immediate return to normal services', 'No need to check for hazards'], 1, 'Aftershocks can cause more damage, so protect yourself whenever shaking returns.'),
    q('earthquake-12', 'You are near the coast after strong shaking. What should you do once it stops?', ['Wait on the beach for a warning', 'Move inland or to higher ground', 'Go closer to the water', 'Use a damaged bridge'], 1, 'A tsunami may follow; move away from the coast promptly and follow local routes.'),
    q('earthquake-13', 'What is safer if you suspect a gas leak after an earthquake?', ['Switch on the lights to inspect it', 'Use a candle', 'Leave and report it from a safe place', 'Test appliances'], 2, 'Flames and electrical switches can create sparks; leave and seek help from safety.'),
    q('earthquake-14', 'If trapped by debris, what may help rescuers find you?', ['Shout continuously until exhausted', 'Use a whistle or knock on a solid surface', 'Light a match', 'Move unstable debris without checking'], 1, 'A whistle or repeated knocking can signal rescuers while conserving energy.'),
    q('earthquake-15', 'What belongs in a household earthquake plan?', ['Only one person’s needs', 'Supplies and communication that include medication and assistive equipment', 'Only a map on one phone', 'No backup power'], 1, 'Plans should account for household members, essential medication, devices and ways to communicate.'),
  ],
  haze: [
    q('haze-1', 'What should determine outdoor-activity changes during haze?', ['Current official health advice', 'A year-old message', 'Smell alone', 'A neighbour’s guess'], 0, 'Use current air-quality and health guidance.'),
    q('haze-2', 'Who may need extra care during haze?', ['Only athletes', 'People with relevant health conditions and vulnerable groups', 'No one indoors', 'Only drivers'], 1, 'Health risks differ and vulnerable people may need tailored advice.'),
    q('haze-3', 'When should a mask be used?', ['Regardless of guidance or fit', 'According to current guidance and suitability', 'Only after sharing it', 'Instead of leaving immediate danger'], 1, 'Mask type, fit, health, and current advice matter.'),
    q('haze-4', 'What medication action is appropriate?', ['Change doses yourself', 'Maintain access and follow professional advice', 'Share prescriptions', 'Remove labels'], 1, 'Medication decisions should follow clinician or pharmacist advice.'),
    q('haze-5', 'What is a useful preparation step?', ['Ignore official readings', 'Plan suitable indoor air management', 'Burn materials indoors', 'Exercise harder outdoors'], 1, 'Indoor exposure reduction may be appropriate when advised.'),
  ],
  'power-outage': [
    q('power-1', 'What is safer for emergency lighting?', ['An open flame', 'A tested torch', 'A damaged cable', 'A hot appliance'], 1, 'A tested torch avoids the added fire risk of open flames.'),
    q('power-2', 'How can phone battery be preserved?', ['Stream continuously', 'Limit unnecessary use', 'Keep maximum brightness', 'Run every app'], 1, 'Reduce nonessential use so communication remains available.'),
    q('power-3', 'What should happen to refrigerator doors?', ['Remain open', 'Stay closed as much as possible', 'Be removed', 'Be opened repeatedly'], 1, 'Keeping doors closed slows temperature rise.'),
    q('power-4', 'Where must fuel-burning equipment not operate?', ['A suitable outdoor location', 'An enclosed space', 'According to safety instructions', 'Away from openings'], 1, 'Enclosed use can cause fatal carbon-monoxide exposure.'),
    q('power-5', 'What makes backup phone power useful?', ['An untested unit without a cable', 'A charged tested unit with a compatible cable', 'A swollen battery', 'A permanently overheated unit'], 1, 'Test the full charging combination and stop using damaged batteries.'),
  ],
  evacuation: [
    q('evac-1', 'What should happen after an official evacuation instruction?', ['Delay for nonessential belongings', 'Use the plan and leave safely', 'Hide the message', 'Return immediately'], 1, 'Follow current instructions without unnecessary delay.'),
    q('evac-2', 'What belongs in a household evacuation plan?', ['One unknown route', 'Routes, meeting point, and communication fallback', 'Only a shopping list', 'No support arrangements'], 1, 'These elements help the household act and reunite.'),
    q('evac-3', 'When should you return?', ['When curious', 'When authorities advise it is safe', 'Immediately after leaving', 'Before hazards are checked'], 1, 'Return only after current official clearance.'),
    q('evac-4', 'Whose needs should be included?', ['Only one adult', 'All relevant household members and pets', 'Nobody requiring assistance', 'Only visitors'], 1, 'A viable plan accounts for real mobility, care, medication, and equipment needs.'),
    q('evac-5', 'Why have a communication fallback?', ['Networks may be disrupted or congested', 'To avoid planning', 'To publish private data', 'To replace evacuation'], 0, 'Alternative contact arrangements help when normal communication fails.'),
  ],
  'kit-maintenance': [
    q('kit-1', 'When should a kit be reviewed?', ['Never after setup', 'Regularly and after use', 'Only after expiry', 'Only when moving'], 1, 'Regular and post-use reviews keep the kit complete.'),
    q('kit-2', 'Which expiry date is most useful for a group of supplies?', ['The latest only', 'The earliest relevant date', 'No date', 'A guessed date'], 1, 'The earliest date identifies the next maintenance need.'),
    q('kit-3', 'What should happen to a leaking or damaged item?', ['Keep it with clean supplies', 'Replace and handle it appropriately', 'Ignore it', 'Hide the damage'], 1, 'Damaged items may be unsafe or unusable.'),
    q('kit-4', 'What equipment should be tested?', ['Only food', 'Torches, radios, power banks, and cables', 'Nothing with batteries', 'Only packaging'], 1, 'Functional testing catches failures before an emergency.'),
    q('kit-5', 'When should kit quantities change?', ['Never', 'When household needs change', 'Only when labels fade', 'When rumours circulate'], 1, 'Household size, health, care, and dietary needs may change.'),
  ],
  'emergency-contacts': [
    q('contacts-1', 'Why keep an offline contact copy?', ['Phones and networks may be unavailable', 'To publish every number', 'To avoid updates', 'To replace emergency services'], 0, 'An offline copy remains accessible during device or network disruption.'),
    q('contacts-2', 'What information should be included?', ['Only unnecessary personal data', 'Essential emergency and household contacts', 'Passwords', 'Unverified numbers'], 1, 'Keep the list minimal, relevant, and current.'),
    q('contacts-3', 'What should separated household members know?', ['Who to contact and where to reunite', 'Nothing about the plan', 'Only social-media passwords', 'An outdated address'], 0, 'A shared contact and meeting plan reduces confusion.'),
    q('contacts-4', 'How should the list be maintained?', ['Never review it', 'Review numbers periodically', 'Add every possible contact', 'Leave outdated entries'], 1, 'Periodic review catches changed or incorrect numbers.'),
    q('contacts-5', 'How should personal information be handled?', ['Collect as much as possible', 'Keep only what is necessary and protect it', 'Post it publicly', 'Share without consent'], 1, 'Data minimisation reduces privacy risk.'),
  ],
};

function rotateOptions(options, correctIndex, amount) {
  const rotated = options.map((_, index) => options[(index + amount) % options.length]);
  const correctAnswer = options[correctIndex];
  return { options: rotated, correctIndex: rotated.indexOf(correctAnswer) };
}

function expandQuestionBank(topicId, baseQuestions) {
  const expandedQuestions = [];

  for (let index = 0; index < baseQuestions.length; index += 1) {
    const question = baseQuestions[index];
    const rotated = rotateOptions(question.options, question.correctIndex, (index % 3) + 1);
    const correctAnswer = question.options[question.correctIndex];

    expandedQuestions.push(
      question,
      q(`${question.id}-scenario`, `Scenario check: ${question.prompt}`, rotated.options, rotated.correctIndex, question.explanation),
      q(`${question.id}-principle`, `Which action best applies the ${topicId.replaceAll('-', ' ')} guidance in this situation?`, [correctAnswer, 'Ignore current official guidance', 'Wait until the situation becomes more dangerous', 'Rely on an unverified forwarded message'], 0, question.explanation),
    );
  }

  return expandedQuestions;
}

const questionBanks = {};
export const quizzes = {};

for (const topicId of Object.keys(startingQuestionsByTopic)) {
  const startingQuestions = startingQuestionsByTopic[topicId];
  const questions = topicId === 'earthquake'
    ? startingQuestions
    : expandQuestionBank(topicId, startingQuestions);
  questionBanks[topicId] = questions;
  quizzes[topicId] = {
    id: topicId,
    title: `${topicId.replaceAll('-', ' ')} readiness check`,
    resourceId: topicId,
    questions,
  };
}

export function getQuiz(quizId) { return quizzes[quizId]; }

function shuffled(values) {
  const result = [...values];

  // Swap each position with a randomly chosen earlier position.
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const selectedValue = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = selectedValue;
  }

  return result;
}

export function createQuizSession(quizId) {
  if (quizId === 'mixed') {
    const mixedQuestions = [];

    for (const topicId of Object.keys(questionBanks)) {
      for (const question of questionBanks[topicId]) {
        mixedQuestions.push({ ...question, topicId });
      }
    }

    return { id: 'mixed', title: 'Mixed emergency readiness check', resourceId: 'mixed', questions: shuffled(mixedQuestions).slice(0, 5) };
  }
  const quiz = quizzes[quizId];
  return quiz ? { ...quiz, questions: shuffled(quiz.questions).slice(0, 5) } : null;
}

export function validateQuizCatalogue() {
  const questionIds = new Set();
  for (const quiz of Object.values(quizzes)) {
    if (quiz.questions.length < 15) throw new Error(`${quiz.id} must contain at least fifteen questions.`);
    for (const question of quiz.questions) {
      if (questionIds.has(question.id)) throw new Error(`Duplicate question ID: ${question.id}`);
      questionIds.add(question.id);
      if (question.options.length !== 4 || question.correctIndex < 0 || question.correctIndex > 3 || !question.explanation) throw new Error(`Invalid question: ${question.id}`);
    }
  }
  return true;
}

validateQuizCatalogue();
