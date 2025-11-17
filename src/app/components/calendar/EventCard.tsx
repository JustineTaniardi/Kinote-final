import { TaskItem } from "./types";
import { formatTime, getDurationText } from "./utils/date";

interface EventCardProps {
  event: TaskItem;
  top: number;
  height: number;
}

const difficultyColorMap = {
  easy: "bg-[#161D36]",
  medium: "bg-[#161D36]",
  hard: "bg-[#161D36]",
};

export default function EventCard({ event, top, height }: EventCardProps) {
  const startTimeFormatted = formatTime(new Date(event.startTime));
  const endTimeFormatted = formatTime(new Date(event.endTime));
  const duration = getDurationText(event.startTime, event.endTime);

  const bgColor =
    difficultyColorMap[event.difficulty as keyof typeof difficultyColorMap] ||
    "bg-[#161D36]";

  return (
    <div
      className={`absolute left-1 right-1 ${bgColor} rounded-md p-2 text-white text-xs shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
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
