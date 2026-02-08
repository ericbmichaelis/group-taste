import { useCountdown } from "../hooks/useCountdown";

const urgencyColors = {
  green: { text: "text-green-600", stroke: "stroke-green-500", bg: "bg-green-50" },
  yellow: { text: "text-yellow-600", stroke: "stroke-yellow-500", bg: "bg-yellow-50" },
  red: { text: "text-red-600", stroke: "stroke-red-500", bg: "bg-red-50" },
};

interface Props {
  expiresAt: number;
  size?: "sm" | "md";
}

export function CountdownTimer({ expiresAt, size = "sm" }: Props) {
  const { formatted, isExpired, progress, urgency } = useCountdown(expiresAt);
  const colors = urgencyColors[urgency];

  if (size === "md") {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              className={colors.stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${colors.text}`}>
            {isExpired ? "0" : `${Math.floor((expiresAt - Date.now()) / 60000)}`}
          </span>
        </div>
        <div>
          <p className={`text-xs font-semibold ${isExpired ? "text-red-500" : colors.text}`}>
            {isExpired ? "Bet Closed" : formatted}
          </p>
          <p className="text-[10px] text-gray-400">
            {isExpired ? "Expired" : "remaining"}
          </p>
        </div>
      </div>
    );
  }

  // Small inline version
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
        isExpired
          ? "bg-red-100 text-red-600"
          : `${colors.bg} ${colors.text}`
      }`}
    >
      <span className="relative flex h-2 w-2">
        {!isExpired && urgency === "red" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isExpired ? "bg-red-500" : urgency === "green" ? "bg-green-500" : urgency === "yellow" ? "bg-yellow-500" : "bg-red-500"
          }`}
        />
      </span>
      {isExpired ? "Closed" : formatted}
    </span>
  );
}
