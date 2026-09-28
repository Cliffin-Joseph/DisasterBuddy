// Curated from the linked official pages. Review these records when contacts change.
export const LOCAL_HELP_REVIEWED_AT = '2026-09-28';

export const localHelpCategories = [
  { id: 'emergency', title: 'Emergency assistance' },
  { id: 'services', title: 'Other urgent help' },
];

export const singaporeHelpResources = [
  {
    id: 'scdf', category: 'emergency', title: 'Fire and emergency ambulance',
    organisation: 'Singapore Civil Defence Force', phone: '995',
    description: 'For fires and medical emergencies in Singapore.',
    sourceUrl: 'https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services',
  },
  {
    id: 'police', category: 'emergency', title: 'Police emergency',
    organisation: 'Singapore Police Force', phone: '999',
    description: 'For immediate police assistance in Singapore.',
    sourceUrl: 'https://www.police.gov.sg/contact-us',
  },
  {
    id: 'police-sms', category: 'emergency', title: 'Police emergency SMS',
    organisation: 'Singapore Police Force', sms: '70999',
    description: 'For emergency police assistance when it is unsafe to call 999 or you cannot speak. Describe what happened and your location in your message.',
    sourceUrl: 'https://www.police.gov.sg/SMS-70999',
  },
  {
    id: 'scdf-sms', category: 'emergency', title: 'SCDF emergency SMS',
    organisation: 'Singapore Civil Defence Force', sms: '70995',
    description: 'For people who are deaf, hard of hearing or have speech impairments needing fire or emergency ambulance assistance. Include the service needed, incident location and what happened. See SCDF’s service instructions.',
    sourceUrl: 'https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services',
  },
  {
    id: 'ambulance', category: 'services', title: 'Non-emergency ambulance',
    organisation: 'Singapore Civil Defence Force',
    description: 'Find private ambulance operator contacts and fees through SCDF’s guidance. SCDF has announced that 1777 will cease from 1 January 2027. Confirm transport arrangements with the provider. Medical emergencies should use 995.',
    sourceUrl: 'https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services',
  },
  {
    id: 'pub', category: 'services', title: 'Urgent water supply feedback',
    organisation: 'PUB', phone: '18002255782', displayPhone: '1800 2255 782',
    description: 'PUB’s 24-hour call centre for urgent feedback including major pipe bursts and water interruptions. Not an emergency rescue service.',
    sourceUrl: 'https://www.pub.gov.sg/contact-us',
  },
].map((resource) => ({ ...resource, areaServed: 'Singapore', reviewedAt: LOCAL_HELP_REVIEWED_AT }));
