import { TaskItem } from "./types";
import { formatTime, getDurationText } from "./utils/date";

interface EventCardProps {
  event: TaskItem;
  top: number;
  height: number;
}

const difficultyColorMap = {
  easy: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-900",
  },
  medium: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-900",
  },
  hard: {
    bg: "bg-red-100",
    border: "border-red-500",
    text: "text-red-900",
  },
};

export default function EventCard({ event, top, height }: EventCardProps) {
  const startTimeFormatted = formatTime(new Date(event.startTime));
  const endTimeFormatted = formatTime(new Date(event.endTime));
  const duration = getDurationText(event.startTime, event.endTime);

  const colors =
    difficultyColorMap[event.difficulty as keyof typeof difficultyColorMap] ||
    difficultyColorMap.medium;

  return (
    <div
      className={`absolute left-1 right-1 ${colors.bg} ${colors.border} ${colors.text} rounded-md p-2 text-xs shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-2`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: "32px",
      }}
      title={`${event.title}\n${startTimeFormatted} - ${endTimeFormatted}\n${duration}`}
    >
      <div className="truncate font-semibold text-xs leading-tight">
        {event.title}
      </div>
      <div className="truncate text-xs opacity-95 leading-tight">
        {startTimeFormatted} — {endTimeFormatted}
      </div>
      {height > 50 && (
        <div className="truncate text-xs opacity-90 leading-tight">{duration}</div>
      )}
    </div>
  );
}
