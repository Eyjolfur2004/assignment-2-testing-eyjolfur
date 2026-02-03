import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentYear,
  add,
  isWithinRange,
  isDateBefore,
  isSameDay,
  getHolidays,
  isHoliday,
} from "../dateUtils";
import { DATE_UNIT_TYPES } from "../constants";

describe("dateUtils", () => {
  describe("getCurrentYear", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the current year (deterministic)", () => {
      vi.setSystemTime(new Date("2026-02-02T12:00:00Z"));
      expect(getCurrentYear()).toBe(2026);
    });
  });

  describe("add", () => {
    it("adds days by default", () => {
      const d = new Date(2026, 0, 1); // Jan 1, 2026 (local time)
      const out = add(d, 2); // default DAYS
      expect(out).toBeInstanceOf(Date);
      expect(out.getFullYear()).toBe(2026);
      expect(out.getMonth()).toBe(0);
      expect(out.getDate()).toBe(3);
    });

    it("adds with the provided unit type", () => {
      const d = new Date(2026, 0, 1);
      const out = add(d, 1, DATE_UNIT_TYPES.MONTHS);
      expect(out.getFullYear()).toBe(2026);
      expect(out.getMonth()).toBe(1); // Feb
      expect(out.getDate()).toBe(1);
    });

    it("supports negative amounts", () => {
      const d = new Date(2026, 0, 10);
      const out = add(d, -3, DATE_UNIT_TYPES.DAYS);
      expect(out.getFullYear()).toBe(2026);
      expect(out.getMonth()).toBe(0);
      expect(out.getDate()).toBe(7);
    });

    it("throws for invalid date input", () => {
      expect(() => add("2026-01-01" as any, 1)).toThrowError(
        "Invalid date provided"
      );

      expect(() => add(new Date("not a date"), 1)).toThrowError(
        "Invalid date provided"
      );
    });

    it("throws for invalid amount input", () => {
      expect(() => add(new Date(2026, 0, 1), "1" as any)).toThrowError(
        "Invalid amount provided"
      );

      expect(() => add(new Date(2026, 0, 1), NaN)).toThrowError(
        "Invalid amount provided"
      );
    });
  });

  describe("isWithinRange", () => {
    it("throws if from is after to", () => {
      const from = new Date(2026, 0, 10);
      const to = new Date(2026, 0, 5);

      expect(() => isWithinRange(new Date(2026, 0, 7), from, to)).toThrowError(
        "Invalid range: from date must be before to date"
      );
    });

    it("returns true when date is strictly between (exclusive boundaries)", () => {
      const from = new Date(2026, 0, 1);
      const to = new Date(2026, 0, 10);

      expect(isWithinRange(new Date(2026, 0, 5), from, to)).toBe(true);
    });

    it("returns false when date equals boundaries (moment default is exclusive)", () => {
      const from = new Date(2026, 0, 1);
      const to = new Date(2026, 0, 10);

      expect(isWithinRange(new Date(2026, 0, 1), from, to)).toBe(false);
      expect(isWithinRange(new Date(2026, 0, 10), from, to)).toBe(false);
    });
  });

  describe("isDateBefore", () => {
    it("returns true when date is before compareDate", () => {
      expect(isDateBefore(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(
        true
      );
    });

    it("returns false when date is after compareDate", () => {
      expect(isDateBefore(new Date(2026, 0, 3), new Date(2026, 0, 2))).toBe(
        false
      );
    });
  });

  describe("isSameDay", () => {
    it("returns true for the same calendar day (even if time differs)", () => {
      const a = new Date(2026, 0, 1, 8, 0, 0);
      const b = new Date(2026, 0, 1, 23, 59, 59);
      expect(isSameDay(a, b)).toBe(true);
    });

    it("returns false for different days", () => {
      expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(
        false
      );
    });
  });

  describe("getHolidays", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns 3 holiday dates for the given year", async () => {
      const p = getHolidays(2026);

      // it resolves after 100ms
      vi.advanceTimersByTime(100);

      const holidays = await p;

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays).toHaveLength(3);

      expect(holidays[0]).toBeInstanceOf(Date);
      expect(holidays[0].getFullYear()).toBe(2026);
    });

    it("includes New Year's Day, Christmas and New Year's Eve", async () => {
      const p = getHolidays(2026);
      vi.advanceTimersByTime(100);
      const holidays = await p;

      const iso = (d: Date) => d.toISOString().slice(0, 10);

      expect(iso(holidays[0])).toBe(iso(new Date(2026, 0, 1)));
      expect(iso(holidays[1])).toBe(iso(new Date(2026, 11, 25)));
      expect(iso(holidays[2])).toBe(iso(new Date(2026, 11, 31)));
    });
  });

  describe("isHoliday", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns true if date matches a holiday (same day)", async () => {
      const p = isHoliday(new Date(2026, 11, 25, 10, 0, 0)); // Jólin
      vi.advanceTimersByTime(100);
      await expect(p).resolves.toBe(true);
    });

    it("returns false if date is not a holiday", async () => {
      const p = isHoliday(new Date(2026, 5, 15));
      vi.advanceTimersByTime(100);
      await expect(p).resolves.toBe(false);
    });
  });
});
