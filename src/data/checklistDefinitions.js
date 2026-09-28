const question = (prompt, options, correctIndex, explanation) => ({ prompt, options, correctIndex, explanation });

export const TASK_INVENTORY_CONFIG = {
  water: { entryLabel: 'Water item or batch', minimumEntries: 1, minimumTotal: 12, quantityUnit: 'litres', categories: [{ id: 'water', label: 'Drinking water', expiryRequired: true }] },
  food: { entryLabel: 'Food item', minimumEntries: 3, quantityUnit: 'servings', categories: [{ id: 'meal', label: 'Ready-to-eat meal', expiryRequired: true }, { id: 'snack', label: 'Shelf-stable snack', expiryRequired: true }, { id: 'other', label: 'Other suitable food', expiryRequired: true }] },
  torch: { entryLabel: 'Lighting component', minimumEntries: 2, quantityUnit: 'units', categories: [{ id: 'torch', label: 'Working torch', required: true }, { id: 'batteries', label: 'Compatible spare battery set', required: true }] },
  firstaid: { entryLabel: 'First-aid item', minimumEntries: 4, quantityUnit: 'units', categories: [{ id: 'dressings', label: 'Dressings and bandages', required: true }, { id: 'antiseptic', label: 'Antiseptic supplies', required: true, expiryRequired: true }, { id: 'gloves', label: 'Disposable gloves', required: true, expiryRequired: true }, { id: 'other', label: 'Other essential item', expiryRequired: true }] },
  radio: { entryLabel: 'Radio component', minimumEntries: 2, quantityUnit: 'units', categories: [{ id: 'radio', label: 'Working portable radio', required: true }, { id: 'batteries', label: 'Compatible spare battery set', required: true }] },
  powerbank: { entryLabel: 'Backup-power component', minimumEntries: 2, quantityUnit: 'units', categories: [{ id: 'powerbank', label: 'Charged power bank', required: true }, { id: 'cable', label: 'Compatible charging cable', required: true }] },
  documents: { entryLabel: 'Protected document', minimumEntries: 3, quantityUnit: 'copies', categories: [{ id: 'identity', label: 'Identification copy', required: true }, { id: 'medical', label: 'Medical or medication information', required: true }, { id: 'contacts', label: 'Emergency contacts', required: true }, { id: 'other', label: 'Other essential document' }] },
  medication: { entryLabel: 'Essential medication', minimumEntries: 1, quantityUnit: 'units or doses', categories: [{ id: 'medication', label: 'Prescribed essential medication', expiryRequired: true }] },
  hygiene: { entryLabel: 'Hygiene item', minimumEntries: 3, quantityUnit: 'units', categories: [{ id: 'hand', label: 'Hand hygiene', required: true }, { id: 'sanitation', label: 'Sanitation supplies', required: true }, { id: 'personal', label: 'Personal or household-specific hygiene', required: true }] },
  masks: { entryLabel: 'Mask supply', minimumEntries: 1, quantityUnit: 'masks', categories: [{ id: 'mask', label: 'Suitable clean mask', expiryRequired: true }] },
  evacuation: { entryLabel: 'Evacuation-plan component', minimumEntries: 3, quantityUnit: 'confirmed item', categories: [{ id: 'route', label: 'Exit route', required: true }, { id: 'meeting', label: 'Meeting point', required: true }, { id: 'contact', label: 'Communication fallback', required: true }] },
  supportneeds: { entryLabel: 'Support arrangement', minimumEntries: 3, quantityUnit: 'confirmed item', categories: [{ id: 'supply', label: 'Required supply or equipment', required: true }, { id: 'assistance', label: 'Assistance or transport', required: true }, { id: 'fallback', label: 'Communication or backup plan', required: true }] },
};

export const CHECKLIST_DEFINITIONS = [
  {
    id: 'water', tier: 1, title: 'Store emergency drinking water', shortTitle: 'Drinking water',
    description: 'Keep safe drinking water available when normal supply is interrupted.',
    whyItMatters: 'Water disruption can happen with little notice. A measured reserve reduces the need to leave home during unsafe conditions.',
    target: 'Start with 12 litres per person: roughly 4 litres per day for three days.',
    quantityLabel: 'Litres stored per person', quantityHelp: 'Count sealed drinking water currently available for each household member.',
    requiredQuantity: 12, unit: 'litres per person', requiresExpiry: true,
    knowledgeCheck: question('A water bottle is unopened but has passed its marked date. What is the best preparedness action?', ['Keep it indefinitely because it is sealed', 'Replace it and rotate the older bottle out', 'Open it now and leave it uncovered', 'Ignore the date until an emergency'], 1, 'Rotate stored water before its marked date so the emergency supply stays current and trustworthy.'),
  },
  {
    id: 'food', tier: 1, title: 'Prepare ready-to-eat food', shortTitle: 'Emergency food',
    description: 'Store food that remains useful without normal cooking or refrigeration.',
    whyItMatters: 'Power, gas, or water may be unavailable. Familiar ready-to-eat food helps the household maintain energy safely.',
    target: 'Prepare at least three days of food for every household member.',
    quantityLabel: 'Days of food available', quantityHelp: 'Estimate complete household coverage, not the number of individual packages.',
    requiredQuantity: 3, unit: 'days', requiresExpiry: true,
    knowledgeCheck: question('Which option is most suitable for an emergency food reserve?', ['Food requiring frozen storage', 'Food requiring lengthy cooking', 'Shelf-stable food your household can eat safely', 'Unlabelled food with an unknown date'], 2, 'Choose labelled, shelf-stable food that matches household dietary needs and can be eaten with limited utilities.'),
  },
  {
    id: 'torch', tier: 1, title: 'Prepare a torch and batteries', shortTitle: 'Torch and batteries',
    description: 'Keep dependable lighting where it can be reached during a power failure.',
    whyItMatters: 'A working torch reduces falls and lets household members move without relying on a phone battery.',
    target: 'Keep at least one tested torch with a spare compatible battery set.',
    quantityLabel: 'Working torches available', quantityHelp: 'Only count torches you have switched on and tested.',
    requiredQuantity: 1, unit: 'working torch', requiresExpiry: false,
    knowledgeCheck: question('Where should the household torch be kept?', ['In a known, easy-to-reach place', 'Inside a locked suitcase', 'Beside loose leaking batteries', 'Somewhere different after every use'], 0, 'Everyone should know a consistent, accessible storage location. Store spare batteries safely and check them periodically.'),
  },
  {
    id: 'firstaid', tier: 1, title: 'Prepare basic first-aid supplies', shortTitle: 'First-aid kit',
    description: 'Keep basic supplies together for minor injuries while professional help is arranged.',
    whyItMatters: 'Organised supplies save time and make it easier to notice missing or expired items.',
    target: 'Maintain one accessible kit and review the earliest expiry date inside it.',
    quantityLabel: 'Complete kits available', quantityHelp: 'Count kits with usable dressings, antiseptic supplies, gloves, and essential household items.',
    requiredQuantity: 1, unit: 'complete kit', requiresExpiry: true,
    knowledgeCheck: question('What should you do after using items from the first-aid kit?', ['Wait until the kit is empty', 'Replace used items and review remaining dates', 'Mix unlabelled medicine into the kit', 'Hide the kit in a new location'], 1, 'Restock promptly and check dates so the kit remains complete for the next incident.'),
  },
  {
    id: 'radio', tier: 2, title: 'Prepare a portable radio', shortTitle: 'Portable radio',
    description: 'Keep a battery-powered radio available for official information during outages.',
    whyItMatters: 'Mobile and internet services may be congested or unavailable. Radio provides an additional information channel.',
    target: 'Keep one tested portable radio with a compatible spare battery set.',
    quantityLabel: 'Working radios available', quantityHelp: 'Only count a radio after testing reception and controls.',
    requiredQuantity: 1, unit: 'working radio', requiresExpiry: false,
    knowledgeCheck: question('During an emergency, which broadcasts should guide your actions?', ['Unverified forwarded messages', 'Current information from official authorities', 'Old recordings from a previous incident', 'Rumours from anonymous accounts'], 1, 'Use current official instructions and compare information before acting on forwarded or unverified claims.'),
  },
  {
    id: 'powerbank', tier: 2, title: 'Maintain backup phone power', shortTitle: 'Backup phone power',
    description: 'Keep a charged power bank and cable suitable for the household’s primary phone.',
    whyItMatters: 'Communication, contact lists, and official information may depend on a phone during an outage.',
    target: 'Maintain at least one tested, charged power bank and compatible cable.',
    quantityLabel: 'Charged power banks', quantityHelp: 'Only count units that charge the intended phone successfully.',
    requiredQuantity: 1, unit: 'charged power bank', requiresExpiry: false,
    knowledgeCheck: question('What is the best way to maintain a stored power bank?', ['Leave it untested for years', 'Test and recharge it on a regular schedule', 'Store it while visibly damaged', 'Keep it permanently connected under bedding'], 1, 'Recharge and test it periodically, follow the manufacturer’s guidance, and stop using damaged or swollen batteries.'),
  },
  {
    id: 'documents', tier: 2, title: 'Protect essential document copies', shortTitle: 'Document copies',
    description: 'Keep essential reference copies together and protected from water.',
    whyItMatters: 'Accessible copies can help with identification, insurance, medication information, and recovery tasks.',
    target: 'Prepare one protected set of only the documents your household genuinely needs.',
    quantityLabel: 'Protected document sets', quantityHelp: 'Count a set only when it is current, organised, and stored securely.',
    requiredQuantity: 1, unit: 'protected set', requiresExpiry: false,
    knowledgeCheck: question('How should sensitive emergency document copies be handled?', ['Leave them visible in a public area', 'Store only necessary copies securely and review them', 'Post them in a group chat', 'Include every document whether useful or not'], 1, 'Minimise sensitive data, protect the copies, and update or securely dispose of outdated versions.'),
  },
  {
    id: 'medication', tier: 2, title: 'Plan essential medication continuity', shortTitle: 'Medication plan',
    description: 'Record how essential prescribed medication will remain available and current.',
    whyItMatters: 'Disruption can make refills or normal travel difficult, especially for time-critical medication.',
    target: 'Maintain one current household medication plan following professional advice.',
    quantityLabel: 'People covered by a plan', quantityHelp: 'Count household members whose essential medication needs have been reviewed.',
    requiredQuantity: 1, unit: 'person covered', requiresExpiry: true,
    knowledgeCheck: question('What is the safest way to plan emergency prescription medication?', ['Change doses without advice', 'Follow clinician or pharmacist advice and rotate before expiry', 'Share medication between household members', 'Remove all labels to save space'], 1, 'Medication needs are individual. Follow professional advice, retain labels, and monitor storage and expiry requirements.'),
  },
  {
    id: 'hygiene', tier: 3, title: 'Prepare hygiene supplies', shortTitle: 'Hygiene supplies',
    description: 'Keep basic hygiene items available when water access or normal shopping is disrupted.',
    whyItMatters: 'Hand and personal hygiene help reduce illness and make an extended disruption more manageable.',
    target: 'Prepare at least three days of suitable supplies for the household.',
    quantityLabel: 'Days of household coverage', quantityHelp: 'Include individual needs rather than using a generic count.',
    requiredQuantity: 3, unit: 'days', requiresExpiry: false,
    knowledgeCheck: question('What makes a hygiene supply plan useful?', ['It reflects actual household needs', 'It contains only one generic item', 'It ignores accessibility needs', 'It depends entirely on running water'], 0, 'Plan for real household needs, including menstrual, infant, older-person, disability, and skin-care requirements where relevant.'),
  },
  {
    id: 'masks', tier: 3, title: 'Keep suitable masks available', shortTitle: 'Protective masks',
    description: 'Keep clean masks available for haze or other situations where authorities recommend them.',
    whyItMatters: 'A suitable, well-fitting mask may reduce exposure when used according to current official guidance.',
    target: 'Keep at least one suitable mask per household member in clean storage.',
    quantityLabel: 'People with a suitable mask', quantityHelp: 'Count people, not loose masks. Consider fit and individual suitability.',
    requiredQuantity: 1, unit: 'person covered', requiresExpiry: true,
    knowledgeCheck: question('When should masks be used during a hazard?', ['According to current official health guidance', 'For every hazard regardless of advice', 'Only after sharing used masks', 'Instead of leaving immediate danger'], 0, 'Follow current health guidance. Mask type, fit, health conditions, and the hazard all matter.'),
  },
  {
    id: 'evacuation', tier: 3, title: 'Create a household evacuation plan', shortTitle: 'Evacuation plan',
    description: 'Agree how household members will leave, communicate, and reunite if instructed.',
    whyItMatters: 'A simple shared plan reduces hesitation and helps account for household members under stress.',
    target: 'Create and discuss one current plan with all relevant household members.',
    quantityLabel: 'Household members briefed', quantityHelp: 'Count only people who know the route, meeting point, and communication fallback.',
    requiredQuantity: 1, unit: 'person briefed', requiresExpiry: false,
    knowledgeCheck: question('What should happen if authorities order an evacuation?', ['Delay to collect unnecessary belongings', 'Follow current instructions and use the agreed plan', 'Use lifts during every building emergency', 'Return before authorities say it is safe'], 1, 'Follow current official instructions. Take essential items only when safe and use the household plan as a practical aid.'),
  },
  {
    id: 'supportneeds', tier: 3, title: 'Plan for additional support needs', shortTitle: 'Support needs plan',
    description: 'Account for children, older adults, disability needs, pets, or essential equipment.',
    whyItMatters: 'Generic plans can fail when transport, communication, care, or power-dependent needs are overlooked.',
    target: 'Document at least one practical support arrangement relevant to the household.',
    quantityLabel: 'Support arrangements confirmed', quantityHelp: 'Count arrangements that name the need, necessary supplies, and a practical fallback.',
    requiredQuantity: 1, unit: 'confirmed arrangement', requiresExpiry: false,
    knowledgeCheck: question('What makes an additional-needs plan viable?', ['It assumes one person will improvise everything', 'It includes supplies, communication, assistance, and a fallback', 'It excludes the person affected', 'It relies on unavailable equipment'], 1, 'Build the plan with the people affected and confirm realistic supplies, assistance, communication, transport, and backup options.'),
  },
];

export function createDefaultChecklistState(definition) {
  return { ...definition, completed: false, quantity: '', expiryDate: '', items: [], progressStep: 0, knowledgePassed: false, status: 'not_started' };
}

export function mergeChecklistDefinitions(definitions, records = []) {
  const recordsById = new Map(records.map((record) => [record.itemId, record]));
  return definitions.map((definition) => {
    const record = recordsById.get(definition.id);
    if (!record) return createDefaultChecklistState(definition);
    const hasProgress = (Array.isArray(record.items) && record.items.length > 0) || record.progressStep > 0 || Number.isFinite(record.quantity) || Boolean(record.expiryDate) || record.knowledgePassed === true;
    return {
      ...createDefaultChecklistState(definition),
      completed: record.completed === true,
      quantity: Number.isFinite(record.quantity) ? String(record.quantity) : '',
      expiryDate: record.expiryDate ?? '',
      items: Array.isArray(record.items) ? record.items : [],
      progressStep: Number.isInteger(record.progressStep) ? Math.max(0, Math.min(3, record.progressStep)) : 0,
      knowledgePassed: record.knowledgePassed === true,
      status: record.completed === true ? 'current_reviewed' : hasProgress ? 'in_progress' : 'not_started',
    };
  });
}
