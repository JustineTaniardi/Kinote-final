export default function TimeColumn() {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <>
      {/* Hours */}
      {hours.map((hour, idx) => {
        const ampm = hour < 12 ? "AM" : "PM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return (
          <div
            key={hour}
            style={{ height: '64px', padding: 0, margin: 0, boxSizing: 'border-box' }}
            className={`flex items-center justify-center border-b border-gray-200 ${idx === hours.length - 1 ? 'border-b-0' : ''}`}
          >
            <span className="text-xs text-gray-500 font-medium">
              {displayHour} {ampm}
            </span>
          </div>
        );
      })}
    </>
  );
}
