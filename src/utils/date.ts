import { addDays, format, isAfter, isSameDay, isSameYear, isValid, isWeekend, parse } from 'date-fns';
import { DB_DATE_FORMAT, getHolidays } from '.';
import { SHOW_DATE_FORMAT } from './constants';

export const toShowDate = (date: string): string => {
    const parsedDate = parse(date, DB_DATE_FORMAT, new Date());
    return format(parsedDate, SHOW_DATE_FORMAT);
};

export const calculateWorkingDays = (start: Date | null, end: Date | null): number => {
    let workingDays = 0;
    let holidays: Date[] = [];

    if (start === null || end === null) return 0;

    if (!isValid(start) || !isValid(end)) return 0;

    if (isSameYear(start, end)) {
        holidays = getHolidays(start.getFullYear());
    } else {
        holidays = getHolidays(start.getFullYear());
        const nextYearHolidays = getHolidays(end.getFullYear());
        holidays = holidays.concat(nextYearHolidays);
    }

    const isHoliday = (date: Date): boolean => holidays.some((holiday) => isSameDay(date, holiday));

    do {
        if (!isWeekend(start) && !isHoliday(start)) {
            workingDays++;
        }

        start = addDays(start, 1);
    } while (!isAfter(start, end));

    return workingDays;
};
