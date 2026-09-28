// Offline learning content adapted from the user's reviewed earthquake resource.
// Keep the wording location-neutral; current local authority instructions come first.
const sourceLabel = 'Adapted from American Red Cross — Earthquake Safety';
const sourceUrl = 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html';
const reviewedAt = '2026-09-28';

function earthquakeArticle(id, title, summary, content) {
  return { id, title, summary, content, sourceLabel, sourceUrl, reviewedAt };
}

export const earthquakeCategory = {
  id: 'earthquake',
  icon: 'EQ',
  title: 'Earthquake safety',
  description: 'Prepare for shaking and know what to do before, during and after an earthquake.',
  emergencyAction: {
    title: 'Shaking now? Drop, Cover, Hold On',
    steps: [
      { title: 'Drop', detail: 'Get onto your hands and knees where you are.' },
      { title: 'Cover', detail: 'Protect your head and neck. Move under a sturdy table if one is close.' },
      { title: 'Hold On', detail: 'Hold your shelter and stay protected until the shaking stops.' },
    ],
  },
  articles: [
    earthquakeArticle(
      'earthquake-about',
      'Understand the risk',
      'Why earthquakes are dangerous and where to find local advice.',
      [
        'An earthquake is sudden ground shaking caused by underground rock movement. It cannot currently be predicted.',
        'Many injuries happen when people try to move during shaking or are struck by falling objects.',
        'Earthquakes can be followed by aftershocks and may also cause tsunamis, landslides, fires, damaged utilities and service outages.',
        'Find out which hazards affect your area and which local agencies issue emergency instructions.',
        'An early-warning system, where available, may give a short warning after an earthquake starts. It does not predict earthquakes.',
      ],
    ),
    earthquakeArticle(
      'earthquake-before',
      'Prepare before shaking',
      'Practise the response, secure your home and plan for your household.',
      [
        'Practise Drop, Cover and Hold On with everyone in your household so the response is familiar.',
        'Secure heavy or breakable items such as shelves, televisions, mirrors and water heaters so they are less likely to fall.',
        'Plan how household members will contact one another if separated. Keep a charged backup battery and a battery-powered radio for official updates.',
        'Prepare portable food, water, medication, first-aid supplies, a torch, spare batteries and important records. Also plan for longer disruption at home.',
        'Keep sturdy shoes, a torch, glasses if needed, a dust mask and a whistle near the bed for an earthquake at night.',
        'Include the needs of children, older adults, people with disabilities, medication users, pets and service animals. Keep chargers or batteries for essential assistive equipment.',
        'Learn first aid and how to turn off utilities safely; arrange professional advice for structural concerns where relevant.',
      ],
    ),
    earthquakeArticle(
      'earthquake-during',
      'Act during shaking',
      'Choose the safest action for where you are.',
      [
        'Indoors: Drop, protect your head and neck, and shelter under a sturdy desk or table if one is close. Hold on until shaking stops.',
        'If no sturdy shelter is close, protect your head and neck near an interior wall away from windows if you can reach it safely.',
        'In bed: Stay there and cover your head and neck with a pillow until shaking stops.',
        'Outdoors: Drop and, if possible, crawl toward an open area away from buildings, trees and electrical lines. Protect your head and neck.',
        'Driving: Pull over somewhere safe, avoid buildings, trees, overpasses and wires, and stay in the vehicle during shaking.',
        'Using a wheelchair or walker: Lock the wheels and remain seated. Brace yourself and protect your head and neck with your arms or another available object.',
        'Do not try to run or walk around during strong shaking. Follow local emergency instructions when available.',
      ],
    ),
    earthquakeArticle(
      'earthquake-after',
      'Stay safe afterward',
      'Check for hazards, aftershocks and further instructions.',
      [
        'Pause before standing. Check yourself and your surroundings for injuries, falling objects and unstable debris. Put on sturdy shoes to avoid broken glass.',
        'If a building may be unsafe, leave carefully when you have a safe route. Stay clear of damaged structures, electrical lines and trees.',
        'Expect aftershocks. Drop, Cover and Hold On again whenever shaking returns.',
        'Near the coast, an earthquake may be followed by a tsunami. Once shaking stops, move quickly inland or to higher ground; do not wait at the shore for a warning.',
        'If trapped, protect your mouth, nose and eyes from dust. Use a whistle or knock loudly on a solid surface to signal rescuers.',
        'Use a torch instead of candles. If you suspect a gas leak, avoid flames, appliances and electrical switches; leave and report it from a safe place.',
        'Check damaged utilities only if you know how to do so safely. Seek professional inspection when structural or utility damage is suspected.',
        'Follow official local updates, tell loved ones you are safe when possible, and seek support if stress becomes difficult to manage.',
      ],
    ),
    earthquakeArticle(
      'earthquake-recap',
      'Quick do and do not recap',
      'A short reminder of the most important actions.',
      [
        'Do: Practise Drop, Cover and Hold On, secure items that could fall, and prepare supplies for your household’s needs.',
        'Do: Protect your head and neck during shaking. Expect aftershocks and repeat the protective action.',
        'Do: Check for broken glass and damage afterward. Follow current local authority instructions.',
        'Do not: Run during shaking or stand near windows and unsecured furniture.',
        'Do not: Enter an unsafe building, cross a damaged bridge or approach fallen electrical lines.',
        'Do not: Stay by the coast after strong shaking while waiting for a tsunami warning.',
        'Do not: Use flames or electrical switches if you suspect a gas leak.',
      ],
    ),
  ],
};
