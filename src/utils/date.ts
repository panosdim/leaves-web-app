import { format, parse } from "date-fns";
import { DB_DATE_FORMAT } from ".";
import { SHOW_DATE_FORMAT } from "./constants";

export const toShowDate = (date: string): string => {
    const parsedDate = parse(date, DB_DATE_FORMAT, new Date());
    return format(parsedDate, SHOW_DATE_FORMAT);
}

