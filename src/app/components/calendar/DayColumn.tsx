import { TaskItem } from "./types";
import EventCard from "./EventCard";
import {
  formatDayLabel,
  isSameDayCheck,
  getEventDimensions,
  isCurrentDay,
} from "./utils/date";

interface DayColumnProps {
  date: Date;
  events: TaskItem[];
}

export default function DayColumn({ date, events }: DayColumnProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for this day
  const dayEvents = events.filter((event) =>
    isSameDayCheck(new Date(event.startTime), date)
  );

  // Group events by the hour they start in
  const eventsByHour: Record<number, TaskItem[]> = {};
  dayEvents.forEach((event) => {
    const eventStart = new Date(event.startTime);
    const startHour = eventStart.getHours();
    if (!eventsByHour[startHour]) {
      eventsByHour[startHour] = [];
    }
    eventsByHour[startHour].push(event);
  });

  const isToday = isCurrentDay(date);

  return (
    <div className="flex-1 border-r border-gray-200 last:border-r-0 bg-white">
      {/* Day Header */}
      <div
        className={`h-16 border-b border-gray-200 flex flex-col items-center justify-center font-semibold text-sm ${
          isToday ? "bg-blue-50 text-blue-900" : "text-gray-900"
        }`}
      >
        {formatDayLabel(date)}
      </div>

      {/* Hour rows */}
      <div className="relative">
        {hours.map((hour) => (
          <div key={hour} className="h-16 border-b border-gray-200 relative">
            {/* Render events for this hour */}
            {eventsByHour[hour] &&
              eventsByHour[hour].map((event) => {
                const { top, height } = getEventDimensions(
                  event.startTime,
                  event.endTime,
                  hour
                );
                return (
                  <EventCard
                    key={`${event.id}-${hour}`}
                    event={event}
                    top={top}
                    height={height}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
