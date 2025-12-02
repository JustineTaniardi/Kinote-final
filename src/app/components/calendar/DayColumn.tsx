import { TaskItem } from "./types";
import EventCard from "./EventCard";
import {
  isSameDayCheck,
  getEventDimensions,
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

  return (
    <>
      {/* Hour rows */}
      {hours.map((hour, idx) => (
        <div
          key={hour}
          style={{ height: '64px', position: 'relative', padding: 0, margin: 0, boxSizing: 'border-box' }}
          className={`border-b border-gray-200 ${idx === hours.length - 1 ? 'border-b-0' : ''}`}
        >
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
    </>
  );
}
