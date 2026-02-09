import { useState } from "react";
import { Users, TrendingUp, ChevronDown, ChevronUp, Lock, Globe, Share2, ShieldCheck, Trophy, XCircle, Gavel } from "lucide-react";
import type { GroupBet } from "../store/betStore";
import { useBetStore, calcPayout } from "../store/betStore";
import { CountdownTimer } from "./CountdownTimer";
import { ShareToGroupModal } from "./ShareToGroupModal";
import { useCountdown } from "../hooks/useCountdown";
import { useAlienPayment, PAY_TOKENS, type PayToken } from "../hooks/useAlienPayment";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

const avatarColors = [
  "bg-purple-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const confettiEmojis = ["🎉", "🎊", "✨", "🔥", "💰"];

export function BetCard({ bet }: { bet: GroupBet }) {
  const [expanded, setExpanded] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showJoinSlider, setShowJoinSlider] = useState(false);
  const [joinStake, setJoinStake] = useState(Math.round((bet.minStake + bet.maxStake) / 2));
  const [payToken, setPayToken] = useState<PayToken>('ALIEN');
  const [payError, setPayError] = useState<string | null>(null);
  const joinBet = useBetStore((s) => s.joinBet);
  const resolveBet = useBetStore((s) => s.resolveBet);
  const currentUserId = useBetStore((s) => s.currentUserId);
  const { payForBet, isLoading: isPaying, reset: resetPayment } = useAlienPayment();

  const countdown = useCountdown(bet.expiresAt);
  const isExpired = countdown.isExpired;
  const isResolved = bet.status === "resolved";
  const isFull = bet.participants.length >= bet.maxParticipants;
  const isJoined = bet.participants.some((p) => p.userId === currentUserId);
  const pot = bet.participants.reduce((sum, p) => sum + p.stake, 0);
  const fillPercent = (bet.participants.length / bet.maxParticipants) * 100;

  const won = isResolved && bet.result === bet.position;
  const myEntry = bet.participants.find((p) => p.userId === currentUserId);
  const myPayout = myEntry && isResolved ? calcPayout(bet, myEntry) : 0;

  async function handleJoin() {
    setPayError(null);
    resetPayment();
    const result = await payForBet(bet.id, joinStake, bet.marketTitle, payToken);
    if (result.status !== 'paid') {
      setPayError(
        result.status === 'cancelled'
          ? 'Payment cancelled'
          : `Payment failed${result.errorCode ? `: ${result.errorCode}` : ''}`
      );
      return;
    }
    joinBet(bet.id, currentUserId, joinStake);
    setJustJoined(true);
    setShowConfetti(true);
    setShowJoinSlider(false);
    setTimeout(() => setJustJoined(false), 2000);
    setTimeout(() => setShowConfetti(false), 1000);
  }

  function handleResolve() {
    const winChance = bet.position === "YES" ? bet.yesBid : bet.noBid;
    const result = Math.random() < winChance ? bet.position : (bet.position === "YES" ? "NO" : "YES");
    resolveBet(bet.id, result);
  }

  const cardBorder = isResolved
    ? won
      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
      : "bg-gradient-to-br from-red-50 to-orange-50 border-red-300"
    : isExpired
      ? "bg-gray-50 border-gray-200 opacity-70"
      : justJoined
        ? "bg-white border-purple-400 shadow-purple-100 shadow-md"
        : "bg-white border-gray-200 hover:shadow-md";

  return (
    <div className={`relative border rounded-xl shadow-sm transition-all duration-300 ${cardBorder}`}>
      {/* Confetti burst */}
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden rounded-xl">
          {confettiEmojis.map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Resolution banner */}
      {isResolved && (
        <div
          className={`px-4 py-3 rounded-t-xl flex items-center gap-2 ${
            won
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {won ? <Trophy size={18} /> : <XCircle size={18} />}
          <div className="flex-1">
            <p className="text-sm font-bold">
              {won ? "Called it! W 🏆" : "L... next time 💀"}
            </p>
            <p className="text-xs opacity-90">
              Market resolved {bet.result}
              {won && myEntry ? ` — Payout: $${myPayout.toFixed(2)}` : myEntry ? ` — Lost $${myEntry.stake}` : ""}
            </p>
          </div>
          {won && (
            <span className="text-2xl">
              {["🎉", "🏆", "💰"][Math.floor(Math.random() * 3)]}
            </span>
          )}
        </div>
      )}

      {/* Main card */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-snug ${isExpired && !isResolved ? "text-gray-500" : "text-gray-900"}`}>
              {bet.marketTitle}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{bet.eventTitle}</p>
          </div>
          {isResolved ? (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              won ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {won ? "W" : "L"}
            </span>
          ) : (
            <CountdownTimer expiresAt={bet.expiresAt} size="md" />
          )}
        </div>

        {/* Position + stake badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              bet.position === "YES"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {bet.position} {bet.position === "YES" ? `${(bet.yesBid * 100).toFixed(0)}¢` : `${(bet.noBid * 100).toFixed(0)}¢`}
          </span>
          <span className="text-xs text-gray-500 font-medium">Up to ${bet.maxStake}/person</span>
          <span className="text-xs text-gray-400">·</span>
          {bet.type === "public" ? (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <Globe size={10} /> Public
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs text-purple-600">
              <Lock size={10} /> Squad only
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={12} />
              {bet.participants.length}/{bet.maxParticipants} in
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-gray-600 font-numbers">
              <TrendingUp size={12} />
              Pot: ${pot}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isResolved
                  ? won
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-red-400 to-orange-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Participant avatars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex -space-x-2">
            {bet.participants.slice(0, 5).map((p) => (
              <div key={p.userId} className="relative" title={`${p.userId} — $${p.stake}`}>
                <div
                  className={`w-7 h-7 rounded-full ${avatarColor(p.userId)} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white`}
                >
                  {getInitials(p.userId)}
                </div>
                <ShieldCheck size={10} className="absolute -bottom-0.5 -right-0.5 text-green-500 bg-white rounded-full" />
              </div>
            ))}
          </div>
          {bet.participants.length > 5 && (
            <span className="text-xs text-gray-400 ml-1">
              +{bet.participants.length - 5} more
            </span>
          )}
        </div>

        {/* Payout breakdown for resolved bets */}
        {isResolved && isJoined && myEntry && (
          <div className={`rounded-xl p-3 mb-3 ${won ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Your stake</span>
              <span className="text-sm font-semibold text-gray-900 font-numbers">${myEntry.stake}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-gray-600">Payout</span>
              <span className={`text-sm font-bold font-numbers ${won ? "text-green-600" : "text-red-600"}`}>
                {won ? `+$${(myPayout - myEntry.stake).toFixed(2)}` : `-$${myEntry.stake}`}
              </span>
            </div>
            {won && (
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-green-200">
                <span className="text-xs font-medium text-green-700">Total return</span>
                <span className="text-sm font-bold text-green-700 font-numbers">${myPayout.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment error */}
        {payError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3 text-xs text-red-600 font-medium">
            {payError}
          </div>
        )}

        {/* Join stake slider */}
        {showJoinSlider && !isJoined && !isExpired && !isFull && !isResolved && (
          <div className="bg-purple-50 rounded-xl p-3 mb-3 animate-fade-in-up">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-purple-700">Pick your stake</span>
              <span className="text-sm font-bold text-purple-700 font-numbers">${joinStake}</span>
            </div>
            <input
              type="range"
              min={bet.minStake}
              max={bet.maxStake}
              value={joinStake}
              onChange={(e) => setJoinStake(Number(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-purple-400 font-numbers">${bet.minStake}</span>
              <span className="text-[10px] text-purple-400 font-numbers">${bet.maxStake}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-purple-500 font-medium">Pay with</span>
              {PAY_TOKENS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPayToken(t.id)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition ${
                    payToken === t.id
                      ? "bg-purple-500 text-white"
                      : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2">
          {isResolved ? (
            <button
              disabled
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${
                won ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {won ? "Called it! W" : "L... maybe next time"}
            </button>
          ) : isExpired && !isResolved ? (
            <button
              onClick={handleResolve}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.97] transition flex items-center justify-center gap-2"
            >
              <Gavel size={14} /> Final answer 🎤
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isJoined && !isExpired && !isFull && !showJoinSlider) {
                  setShowJoinSlider(true);
                } else {
                  handleJoin();
                }
              }}
              disabled={isExpired || isFull || isJoined || isPaying}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isPaying
                  ? "bg-purple-300 text-white cursor-wait"
                  : justJoined
                    ? "bg-purple-500 text-white scale-[0.98]"
                    : isJoined
                      ? "bg-purple-100 text-purple-700 cursor-default"
                      : isFull
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : showJoinSlider
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-[0.97] shadow-sm"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-[0.97] shadow-sm"
              }`}
            >
              {isPaying
                ? "Processing payment..."
                : justJoined
                  ? "Locked in! 🔒"
                  : isJoined
                    ? "You're in ✓"
                    : isFull
                      ? "Full"
                      : showJoinSlider
                        ? `Same — $${joinStake} stake 🤝`
                        : `I'm in — Up to $${bet.maxStake}`}
            </button>
          )}
          <button
            onClick={() => setShowShare(true)}
            className="p-2.5 rounded-xl border border-gray-200 text-purple-500 hover:bg-purple-50 transition"
            title="Put your friends on"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Started by</span>
              <span className="font-medium text-gray-900">{bet.createdBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-gray-900 capitalize">{bet.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Max pot</span>
              <span className="font-medium text-gray-900 font-numbers">${bet.maxStake * bet.maxParticipants}</span>
            </div>
            {isResolved && (
              <div className="flex justify-between">
                <span className="text-gray-500">Result</span>
                <span className={`font-bold ${bet.result === bet.position ? "text-green-600" : "text-red-600"}`}>
                  Market: {bet.result} — {bet.result === bet.position ? "W" : "L"}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Group wallet</span>
              <span className="font-mono text-xs text-gray-400 truncate max-w-[160px]">
                {bet.groupWallet}
              </span>
            </div>
          </div>

          {/* Full participant list */}
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">
            Squad ({bet.participants.length})
          </h4>
          <div className="space-y-1.5">
            {bet.participants.map((p, i) => (
              <div key={p.userId} className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className={`w-6 h-6 rounded-full ${avatarColor(p.userId)} flex items-center justify-center text-[9px] font-bold text-white`}
                  >
                    {getInitials(p.userId)}
                  </div>
                  <ShieldCheck size={8} className="absolute -bottom-0.5 -right-0.5 text-green-500 bg-white rounded-full" />
                </div>
                <span className="text-sm text-gray-700">{p.userId}</span>
                <span className="text-xs text-gray-400 font-numbers">${p.stake}</span>
                {isResolved && (
                  <span className={`text-xs font-medium font-numbers ${won ? "text-green-600" : "text-red-500"}`}>
                    {won ? `+$${calcPayout(bet, p).toFixed(2)}` : `-$${p.stake}`}
                  </span>
                )}
                <ShieldCheck size={12} className="text-green-500" />
                {i === 0 && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                    OG
                  </span>
                )}
                {p.userId === currentUserId && (
                  <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showShare && (
        <ShareToGroupModal bet={bet} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
