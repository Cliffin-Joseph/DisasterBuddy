import { earthquakeCategory } from './earthquakeResource';

const reviewedAt = '2026-08-17';
const sourceLabel = 'Singapore Civil Defence Force and relevant Singapore Government guidance';

export const resourceIconUrls = {
  fire: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',
  flood: 'https://cdn-icons-png.flaticon.com/512/1164/1164551.png',
  earthquake: 'https://cdn-icons-png.flaticon.com/512/1092/1092923.png',
  haze: 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png',
  'power-outage': 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
  evacuation: 'https://cdn-icons-png.flaticon.com/512/1022/1022382.png',
  'kit-maintenance': 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
  'emergency-contacts': 'https://cdn-icons-png.flaticon.com/512/724/724664.png',
};

const article = (id, title, summary, content) => ({ id, title, summary, content, sourceLabel, reviewedAt });

export const resourceCategories = [
  { id: 'fire', icon: 'F', title: 'Fire safety', description: 'Prevent household fires and respond safely.', articles: [article('fire-essential', 'Household fire essentials', 'Reduce fire risk and know what to do if a fire starts.', ['Keep exits and escape routes clear.', 'Install and maintain suitable smoke alarms where appropriate.', 'If a fire occurs, alert others, leave by the safest available route, and call emergency services from safety.', 'Do not re-enter until authorities say it is safe.', 'Never use a lift during a building fire evacuation.'])] },
  { id: 'flood', icon: 'W', title: 'Flood', description: 'Avoid floodwater and prepare for intense rain.', articles: [article('flood-essential', 'Flood preparedness', 'Prepare early and avoid dangerous water.', ['Monitor current official advisories during intense rain.', 'Move to safer or higher locations when instructed.', 'Do not walk, cycle, or drive through floodwater.', 'Keep important copies and essential supplies protected from water.', 'Avoid electrical equipment exposed to water and seek qualified advice.'])] },
  earthquakeCategory,
  { id: 'haze', icon: 'H', title: 'Haze', description: 'Reduce exposure and follow current health advice.', articles: [article('haze-essential', 'Haze health preparation', 'Plan around current air-quality and health guidance.', ['Check current official air-quality and health advisories.', 'Reduce strenuous outdoor activity when advised.', 'Close openings when appropriate and maintain suitable indoor ventilation or filtration.', 'Keep necessary medication available according to professional advice.', 'Use a suitable mask only according to current health guidance and individual suitability.'])] },
  { id: 'power-outage', icon: 'P', title: 'Power outage', description: 'Stay safe and preserve communication during outages.', articles: [article('power-essential', 'Power outage essentials', 'Prepare lighting, communication, and food-safety options.', ['Use a tested torch rather than an open flame.', 'Keep power banks charged and compatible cables available.', 'Limit unnecessary phone use to preserve battery.', 'Keep refrigerator and freezer doors closed as much as possible.', 'Never operate fuel-burning equipment in enclosed spaces.'])] },
  { id: 'evacuation', icon: 'E', title: 'Evacuation', description: 'Leave safely when authorities instruct you to do so.', articles: [article('evacuation-essential', 'Household evacuation plan', 'Agree routes, meeting points, and communication fallbacks.', ['Know more than one safe exit route where possible.', 'Agree a meeting point and communication fallback.', 'Account for medication, mobility, children, older adults, pets, and essential equipment.', 'Take essential items only when safe and do not delay an instructed evacuation.', 'Return only when authorities advise that it is safe.'])] },
  { id: 'kit-maintenance', icon: 'K', title: 'Kit maintenance', description: 'Keep emergency supplies complete and current.', articles: [article('kit-essential', 'Maintain your emergency kit', 'Rotate dated supplies and test equipment regularly.', ['Review the kit on a regular schedule and after using anything.', 'Replace expired, damaged, leaking, or missing items.', 'Record the earliest relevant expiry date for each stored item.', 'Test torches, radios, power banks, and compatible cables.', 'Adjust quantities and special supplies when household needs change.'])] },
  { id: 'emergency-contacts', icon: 'C', title: 'Emergency contacts', description: 'Keep essential contact information accessible.', articles: [article('contacts-essential', 'Emergency contact planning', 'Maintain a small, current contact list with an offline copy.', ['Keep emergency-service and important household contacts accessible.', 'Store an offline copy in case the phone is unavailable.', 'Include relevant medical or care contacts where appropriate.', 'Agree who household members should contact if separated.', 'Review numbers periodically and protect unnecessary personal information.'])] },
];

export function getResourceCategory(categoryId) { return resourceCategories.find((category) => category.id === categoryId); }
