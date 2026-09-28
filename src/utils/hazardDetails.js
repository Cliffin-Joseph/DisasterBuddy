export function formatAlertDate(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleString();
}

export function formatAlertDistance(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `${value.toLocaleString()} km from your last used location`
    : 'Distance unavailable';
}

// Do not open arbitrary URLs or custom schemes delivered by an external feed.
export function getOfficialReportUrl(value) {
  try {
    const url = new URL(value);
    const isGdacs = url.hostname === 'gdacs.org' || url.hostname.endsWith('.gdacs.org');
    if (isGdacs && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.port) {
      url.protocol = 'https:';
      return url.toString();
    }
  } catch { /* Missing or malformed feed URLs use the official homepage. */ }
  return 'https://www.gdacs.org/';
}

export function getRelatedGuides(typeCode) {
  // Household fire advice is not a substitute for wildfire response guidance.
  if (typeCode === 'FL') return [{ categoryId: 'flood', title: 'Flood preparedness' }];
  if (typeCode === 'EQ') return [{ categoryId: 'earthquake', title: 'Earthquake safety' }];
  return [];
}
