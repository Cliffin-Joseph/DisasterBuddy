import { singaporeHelpResources, localHelpCategories } from '../src/data/localHelpData';
import { resourceCategories } from '../src/data/resourceData';
import { formatAlertDate, formatAlertDistance, getOfficialReportUrl, getRelatedGuides } from '../src/utils/hazardDetails';

describe('Singapore local help', () => {
  test('every entry has a unique ID, official source, category and review date', () => {
    expect(new Set(singaporeHelpResources.map((item) => item.id)).size).toBe(singaporeHelpResources.length);
    for (const item of singaporeHelpResources) {
      expect(item.areaServed).toBe('Singapore');
      expect(item.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new URL(item.sourceUrl).hostname.endsWith('.gov.sg')).toBe(true);
      expect(localHelpCategories.some((category) => category.id === item.category)).toBe(true);
      if (item.phone || item.sms) expect(item.phone || item.sms).toMatch(/^\d+$/);
    }
  });
  test('uses current police SMS and separates SCDF SMS', () => {
    expect(singaporeHelpResources.find((item) => item.id === 'police-sms').sms).toBe('70999');
    expect(singaporeHelpResources.find((item) => item.id === 'scdf-sms').sms).toBe('70995');
    expect(singaporeHelpResources.find((item) => item.id === 'scdf').phone).toBe('995');
    expect(singaporeHelpResources.find((item) => item.id === 'police').phone).toBe('999');
  });
  test('does not offer a soon-discontinued 1777 call button', () => {
    expect(singaporeHelpResources.some((item) => item.phone === '1777')).toBe(false);
  });
  test('does not include community support or directory entries', () => {
    expect(localHelpCategories.map((category) => category.id)).toEqual(['emergency', 'services']);
    expect(singaporeHelpResources.some((item) => item.category === 'community')).toBe(false);
  });
});

describe('hazard detail helpers', () => {
  test.each([null, undefined, '', 'invalid'])('missing or invalid date %s is explicit', (value) => {
    expect(formatAlertDate(value)).toBe('Not provided');
  });
  test.each([null, undefined, NaN, Infinity, -1, '10'])('invalid distance %s is not shown as zero', (value) => {
    expect(formatAlertDistance(value)).toBe('Distance unavailable');
  });
  test('zero distance is valid but does not imply safety', () => {
    expect(formatAlertDistance(0)).toBe('0 km from your last used location');
  });
  test.each(['javascript:alert(1)', 'https://gdacs.org.evil.test/', 'https://evil.test/gdacs.org', 'https://user:pass@gdacs.org/', null])('untrusted report URL %s falls back', (url) => {
    expect(getOfficialReportUrl(url)).toBe('https://www.gdacs.org/');
  });
  test('preserves official paths and upgrades old HTTP links', () => {
    expect(getOfficialReportUrl('http://www.gdacs.org/report.aspx?id=123')).toBe('https://www.gdacs.org/report.aspx?id=123');
  });
  test('linked topics exist and unsupported hazards do not get misleading fire guidance', () => {
    for (const guide of getRelatedGuides('FL')) expect(resourceCategories.some((category) => category.id === guide.categoryId)).toBe(true);
    expect(getRelatedGuides('FL')[0].categoryId).toBe('flood');
    expect(getRelatedGuides('WF')).toEqual([]);
    expect(getRelatedGuides('EQ')).toEqual([{ categoryId: 'earthquake', title: 'Earthquake safety' }]);
    expect(getRelatedGuides('unknown')).toEqual([]);
  });
});
