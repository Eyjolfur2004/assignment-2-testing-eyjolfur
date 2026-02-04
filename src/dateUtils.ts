import moment from "moment";
import { DATE_UNIT_TYPES } from "./constants";

export function getCurrentYear(): number {
  return moment().year();
}

export function add(
  date: Date,
  amount: number,
  type: string = DATE_UNIT_TYPES.DAYS
): Date {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Invalid amount provided");
  }
  return moment(date).add(amount, type).toDate();
}

export function isWithinRange(date: Date, from: Date, to: Date): boolean {
  if (moment(from).isAfter(to)) {
    throw new Error("Invalid range: from date must be before to date");
  }
  return moment(date).isBetween(from, to);
}

export function isDateBefore(date: Date, compareDate: Date): boolean {
  return moment(date).isBefore(compareDate);
}

export function isSameDay(date: Date, compareDate: Date): boolean {
  return moment(date).isSame(compareDate, "day");
}

export async function getHolidays(year: number): Promise<Date[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        new Date(year, 0, 1),
        new Date(year, 11, 25),
        new Date(year, 11, 31),
      ]);
    }, 100);
  });
}

export async function isHoliday(date: Date): Promise<boolean> {
  const holidays = await getHolidays(date.getFullYear());
  return holidays.some((holiday) => isSameDay(date, holiday));
}
