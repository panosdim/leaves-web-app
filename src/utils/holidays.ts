import { addDays, isWeekend, nextMonday, subDays } from 'date-fns';

const getOrthodoxEaster = (year: number): Date => {
    let oed: Date;

    let r1: number = year % 4;
    let r2: number = year % 7;
    let r3: number = year % 19;
    let r4: number = (19 * r3 + 15) % 30;
    let r5: number = (2 * r1 + 4 * r2 + 6 * r4 + 6) % 7;
    let days: number = r5 + r4 + 13;

    if (days > 39) {
        days = days - 39;
        oed = new Date(year, 4, days);
    } else if (days > 9) {
        days = days - 9;
        oed = new Date(year, 3, days);
    } else {
        days = days + 22;
        oed = new Date(year, 2, days);
    }
    return oed;
};

export const getHolidays = (year: number): Date[] => {
    let holidays: Date[] = [];
    holidays.push(new Date(year, 0, 1));
    holidays.push(new Date(year, 0, 6));
    let easter = getOrthodoxEaster(year);
    holidays.push(subDays(easter, 48));
    holidays.push(new Date(year, 2, 25));
    holidays.push(subDays(easter, 2));
    holidays.push(addDays(easter, 1));
    // Check if 1st May is moved
    const firstMay = new Date(year, 4, 1);
    if (isWeekend(firstMay)) {
        holidays.push(nextMonday(firstMay));
    } else {
        holidays.push(firstMay);
    }
    holidays.push(addDays(easter, 50));
    holidays.push(new Date(year, 7, 15));
    holidays.push(new Date(year, 9, 28));
    holidays.push(new Date(year, 11, 25));
    holidays.push(new Date(year, 11, 26));

    return holidays;
};
