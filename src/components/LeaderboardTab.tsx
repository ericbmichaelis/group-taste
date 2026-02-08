import { Crown, ShieldCheck } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "alex.eth", wins: 24, profit: "+$1,240", avatar: "👑" },
  { rank: 2, name: "maria_builds", wins: 19, profit: "+$890", avatar: "🥈" },
  { rank: 3, name: "chad_stacks", wins: 17, profit: "+$720", avatar: "🥉" },
  { rank: 4, name: "jenny.base", wins: 14, profit: "+$510" },
  { rank: 5, name: "0xSamurai", wins: 12, profit: "+$430" },
  { rank: 6, name: "degen_dan", wins: 11, profit: "+$380" },
  { rank: 7, name: "vitalik_fan", wins: 9, profit: "+$290" },
  { rank: 8, name: "ser_whale", wins: 8, profit: "+$210" },
  { rank: 9, name: "anon_bettor", wins: 7, profit: "+$180" },
  { rank: 10, name: "lucky_luis", wins: 5, profit: "+$90" },
];

const podiumStyles: Record<number, string> = {
  1: "bg-gradient-to-b from-yellow-50 to-yellow-100/50 border-yellow-300",
  2: "bg-gradient-to-b from-gray-50 to-gray-100/50 border-gray-300",
  3: "bg-gradient-to-b from-orange-50 to-orange-100/50 border-orange-300",
};

export function LeaderboardTab() {
  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={20} className="text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Hall of Fame</h2>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 stagger-children">
        {leaderboard.slice(0, 3).map((user) => (
          <div
            key={user.rank}
            className={`animate-fade-in-up flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 hover:scale-[1.03] transition-transform ${podiumStyles[user.rank]}`}
          >
            <span className="text-2xl sm:text-3xl">{user.avatar}</span>
            <p className="font-bold text-gray-900 text-xs sm:text-sm mt-2 truncate w-full text-center">
              {user.name}
            </p>
            <p className="text-green-600 font-semibold text-xs sm:text-sm font-numbers">{user.profit}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-[10px] sm:text-xs text-gray-500">{user.wins} W's</p>
              <ShieldCheck size={10} className="text-green-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Rest of leaderboard */}
      <div className="space-y-2 stagger-children">
        {leaderboard.slice(3).map((user) => (
          <div
            key={user.rank}
            className="animate-fade-in-up flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-purple-200 hover:shadow-sm transition-all"
          >
            <span className="w-6 text-center text-sm font-bold text-gray-400">
              {user.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                <ShieldCheck size={12} className="text-green-500 shrink-0" />
              </div>
              <p className="text-xs text-gray-500">{user.wins} W's</p>
            </div>
            <span className="text-green-600 font-semibold text-sm font-numbers">
              {user.profit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
