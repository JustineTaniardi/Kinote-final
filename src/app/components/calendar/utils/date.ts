import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  format,
  differenceInMinutes,
  setHours,
  setMinutes,
  isSameDay,
  isToday as fnIsToday,
} from "date-fns";
import { id } from "date-fns/locale";

export const getWeekDays = (date: Date) => {
  // Always start from today, then show next 6 days
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
};

export const formatDayLabel = (date: Date): string => {
  const dayName = format(date, "EEEE", { locale: id });
  const dayNumber = format(date, "d");
  const capitalizedDay =
    dayName.charAt(0).toUpperCase() + dayName.slice(1);
  return `${capitalizedDay} ${dayNumber}`;
};

export const formatTime = (date: Date): string => {
  return format(date, "HH:mm");
};

export const getDurationText = (
  startTime: string,
  endTime: string
): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const minutes = differenceInMinutes(end, start);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}j`;
  return `${hours}j ${mins}m`;
};

export const getEventDimensions = (
  startTime: string,
  endTime: string,
  gridStartHour: number = 1
): { top: number; height: number } => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const gridStart = setHours(setMinutes(start, 0), gridStartHour);
  const diffMinutes = differenceInMinutes(start, gridStart);

  const rowHeight = 64; // h-16 in Tailwind = 4rem = 64px
  const top = Math.max(0, (diffMinutes / 60) * rowHeight);

  const durationMinutes = differenceInMinutes(end, start);
  const height = Math.max(rowHeight * 0.4, (durationMinutes / 60) * rowHeight);

  return { top, height };
};

export const isSameDayCheck = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const isCurrentDay = (date: Date): boolean => {
  return fnIsToday(date);
};

export const getWeekRange = (date: Date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
};

export const isCurrentWeek = (date: Date): boolean => {
  const today = new Date();
  const { weekStart, weekEnd } = getWeekRange(date);
  return today >= weekStart && today <= weekEnd;
};
