import {
  format,
  formatISO,
  getDate,
  getDay,
  getMonth,
  getYear,
  isValid,
  parse,
  parseISO,
  setDate,
  setMonth,
  setYear,
  startOfWeek,
} from "date-fns-jalali";
import { faIR } from "date-fns/locale";

export const DateFnsAdapter = {
  formatWeekdayName: (date: Date) => format(date, "EEEE", { locale: faIR }),
  formatCaption: (date: Date) => format(date, "MMMM yyyy", { locale: faIR }),
  formatDay: (date: Date) => format(date, "d", { locale: faIR }),
  formatMonthCaption: (date: Date) => format(date, "MMMM", { locale: faIR }),
  formatYearCaption: (date: Date) => format(date, "yyyy", { locale: faIR }),
  getWeekdays: () => {
    const start = startOfWeek(new Date(), { locale: faIR });
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = setDate(start, getDate(start) + i);
      days.push(format(day, "EEEEEE", { locale: faIR }));
    }
    return days;
  },
  getYear: (date: Date) => getYear(date),
  getMonth: (date: Date) => getMonth(date),
  getDate: (date: Date) => getDate(date),
  getDayOfWeek: (date: Date) => getDay(date),
  toDate: (value: string | number | Date) => {
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
    }
    return new Date(value);
  },
  format: (date: Date) => formatISO(date),
  parse: (value: string, format: string) => parse(value, format, new Date()),
  setYear: (date: Date, year: number) => setYear(date, year),
  setMonth: (date: Date, month: number) => setMonth(date, month),
};
