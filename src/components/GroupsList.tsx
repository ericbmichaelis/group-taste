import { useEffect, useMemo, useState } from "react";
import { Users, MessageCircle, ChevronRight, Globe, Lock } from "lucide-react";
import { useBetStore, type GroupBet } from "../store/betStore";
import { useAppStore } from "../lib/store";
import { GroupChat } from "./GroupChat";
import { CountdownTimer } from "./CountdownTimer";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function GroupsList() {
  const allBets = useBetStore((s) => s.bets);
  const [openBet, setOpenBet] = useState<GroupBet | null>(null);
  const deepLinkBetId = useAppStore((s) => s.deepLinkBetId);
  const setDeepLinkBetId = useAppStore((s) => s.setDeepLinkBetId);

  useEffect(() => {
    if (deepLinkBetId) {
      const bet = allBets.find((b) => b.id === deepLinkBetId);
      if (bet) {
        setOpenBet(bet);
      }
      setDeepLinkBetId(null);
    }
  }, [deepLinkBetId, allBets, setDeepLinkBetId]);

  const activeBets = useMemo(
    () => allBets.filter((b) => Date.now() < b.expiresAt),
    [allBets]
  );
  const expiredBets = useMemo(
    () => allBets.filter((b) => Date.now() >= b.expiresAt),
    [allBets]
  );

  if (allBets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <MessageCircle size={48} className="mb-3 text-gray-300" />
        <p className="text-sm font-medium">No squads yet</p>
        <p className="text-xs mt-1">Lock in a take to start a squad</p>
      </div>
    );
  }

  function BetGroupCard({ bet }: { bet: GroupBet }) {
    const lastMsg = bet.messages[bet.messages.length - 1];
    const isExpired = Date.now() >= bet.expiresAt;

    return (
      <button
        onClick={() => setOpenBet(bet)}
        className={`w-full text-left rounded-xl p-4 transition ${
          isExpired
            ? "bg-gray-50 border border-gray-200 opacity-60"
            : "bg-white border border-gray-200 hover:border-purple-200 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Position badge as avatar */}
          <div
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 ${
              bet.position === "YES"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span className="text-xs font-bold">{bet.position}</span>
            <span className="text-[10px] font-numbers">${bet.maxStake}</span>
          </div>

          {/* Group info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {bet.marketTitle}
              </h3>
              <span className="text-[11px] text-gray-400 shrink-0">
                {lastMsg ? timeAgo(lastMsg.timestamp) : ""}
              </span>
            </div>
            {lastMsg && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {lastMsg.sender === "system" ? lastMsg.text : `${lastMsg.sender}: ${lastMsg.text}`}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <Users size={10} />
                {bet.participants.length}/{bet.maxParticipants}
              </span>
              {bet.type === "public" ? (
                <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                  <Globe size={9} /> Public
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[11px] text-purple-500">
                  <Lock size={9} /> Squad only
                </span>
              )}
              {!isExpired && (
                <CountdownTimer expiresAt={bet.expiresAt} />
              )}
              {isExpired && (
                <span className="text-[11px] text-red-400">Time's up</span>
              )}
            </div>
          </div>

          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <>
      {activeBets.length > 0 && (
        <div className="space-y-2 mb-4">
          {activeBets.map((bet) => (
            <BetGroupCard key={bet.id} bet={bet} />
          ))}
        </div>
      )}

      {expiredBets.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Time's up
          </p>
          <div className="space-y-2">
            {expiredBets.map((bet) => (
              <BetGroupCard key={bet.id} bet={bet} />
            ))}
          </div>
        </>
      )}

      {/* XMTP badge */}
      <div className="mt-4 flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-xs">
        <MessageCircle size={14} className="shrink-0" />
        <span>Squad chats powered by XMTP 🔐</span>
      </div>

      {openBet && (
        <GroupChat bet={openBet} onBack={() => setOpenBet(null)} />
      )}
    </>
  );
}
