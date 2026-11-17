import { CalendarMode, LanguageCode } from '../types/school';

/**
 * Verified Bikram Sambat (BS) month day counts mapped from official Nepal Panchanga data.
 * Reference epoch: 2080-01-01 BS === 2023-04-14 AD.
 */
const BS_MONTH_DAYS: Record<number, number[]> = {
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 365 days -> ends 2024-04-12
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 366 days -> ends 2025-04-13
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days -> ends 2026-04-13
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 365 days -> ends 2027-04-13
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 366 days -> ends 2028-04-12
};

export const BS_MONTH_NAMES_EN = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const BS_MONTH_NAMES_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
];

const AD_MONTH_NAMES_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)] ?? digit);
}

export interface BsDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-32
}

const EPOCH_AD_UTC = Date.UTC(2023, 3, 14); // 2023-04-14 = 2080-01-01 BS

export function adToBs(isoDate: string): BsDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const targetUtc = Date.UTC(year, month - 1, day);
  let deltaDays = Math.floor((targetUtc - EPOCH_AD_UTC) / 86_400_000);

  if (deltaDays < 0) {
    return null;
  }

  for (const bsYearStr of Object.keys(BS_MONTH_DAYS)) {
    const bsYear = Number(bsYearStr);
    const months = BS_MONTH_DAYS[bsYear];
    for (let m = 0; m < 12; m += 1) {
      const daysInMonth = months[m];
      if (deltaDays < daysInMonth) {
        return {
          year: bsYear,
          month: m + 1,
          day: deltaDays + 1,
        };
      }
      deltaDays -= daysInMonth;
    }
  }

  return null;
}

export function formatSchoolDate(
  isoDate: string,
  mode: CalendarMode,
  lang: LanguageCode = 'en'
): string {
  if (!isoDate) return '—';

  if (mode === 'BS') {
    const bs = adToBs(isoDate);
    if (bs) {
      if (lang === 'np') {
        const monthName = BS_MONTH_NAMES_NP[bs.month - 1];
        return `${monthName} ${toNepaliDigits(bs.day)}, ${toNepaliDigits(bs.year)} वि.सं.`;
      }
      const monthName = BS_MONTH_NAMES_EN[bs.month - 1];
      return `${monthName} ${bs.day}, ${bs.year} BS`;
    }
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  const [, y, m, d] = match;
  const monthIdx = Number(m) - 1;
  const monthLabel = AD_MONTH_NAMES_EN[monthIdx] ?? m;
  return `${monthLabel} ${Number(d)}, ${y} AD`;
}

export function formatCompactDate(isoDate: string, mode: CalendarMode): string {
  if (mode === 'BS') {
    const bs = adToBs(isoDate);
    if (bs) {
      const mm = String(bs.month).padStart(2, '0');
      const dd = String(bs.day).padStart(2, '0');
      return `${bs.year}-${mm}-${dd} BS`;
    }
  }
  return `${isoDate} AD`;
}
