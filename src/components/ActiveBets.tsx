import { useMemo, useState } from "react";
import { Clock, Trophy } from "lucide-react";
import { useBetStore } from "../store/betStore";
import { BetCard } from "./BetCard";

export function ActiveBets() {
  const allBets = useBetStore((s) => s.bets);
  const [showExpired, setShowExpired] = useState(false);
  const [showResolved, setShowResolved] = useState(true);

  const activeBets = useMemo(
    () => allBets.filter((b) => b.status === "open" && Date.now() < b.expiresAt),
    [allBets]
  );
  const expiredBets = useMemo(
    () => allBets.filter((b) => b.status !== "resolved" && Date.now() >= b.expiresAt),
    [allBets]
  );
  const resolvedBets = useMemo(
    () => allBets.filter((b) => b.status === "resolved"),
    [allBets]
  );

  if (allBets.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          Live Takes
          {activeBets.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({activeBets.length})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {resolvedBets.length > 0 && (
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 transition"
            >
              <Trophy size={12} />
              {showResolved ? "Hide" : "Show"} settled ({resolvedBets.length})
            </button>
          )}
          {expiredBets.length > 0 && (
            <button
              onClick={() => setShowExpired(!showExpired)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <Clock size={12} />
              {showExpired ? "Hide" : "Show"} expired ({expiredBets.length})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {activeBets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>

      {showResolved && resolvedBets.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Trophy size={12} /> Settled
          </p>
          <div className="space-y-3">
            {resolvedBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        </div>
      )}

      {showExpired && expiredBets.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Time's up — Pending
          </p>
          <div className="space-y-3">
            {expiredBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
