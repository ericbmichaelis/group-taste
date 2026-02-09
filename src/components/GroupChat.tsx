import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Users, Lock, Clock, Link2, Check } from "lucide-react";
import { useBetStore, type GroupBet } from "../store/betStore";
import { CountdownTimer } from "./CountdownTimer";
import { useAlienPayment, PAY_TOKENS, type PayToken } from "../hooks/useAlienPayment";

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
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface Props {
  bet: GroupBet;
  onBack: () => void;
}

export function GroupChat({ bet, onBack }: Props) {
  const [input, setInput] = useState("");
  const [joinStake, setJoinStake] = useState(Math.round((bet.minStake + bet.maxStake) / 2));
  const [linkCopied, setLinkCopied] = useState(false);
  const [payToken, setPayToken] = useState<PayToken>('ALIEN');
  const [payError, setPayError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserId = useBetStore((s) => s.currentUserId);
  const addMessage = useBetStore((s) => s.addMessage);
  const joinBet = useBetStore((s) => s.joinBet);
  const { payForBet, isLoading: isPaying, reset: resetPayment } = useAlienPayment();

  const liveBet = useBetStore((s) => s.bets.find((b) => b.id === bet.id));
  const messages = liveBet?.messages ?? [];
  const participants = liveBet?.participants ?? bet.participants;
  const isJoined = participants.some((p) => p.userId === currentUserId);
  const isFull = participants.length >= bet.maxParticipants;
  const isExpired = Date.now() >= bet.expiresAt;
  const pot = participants.reduce((sum, p) => sum + p.stake, 0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    if (!input.trim()) return;
    addMessage(bet.id, { sender: currentUserId, text: input.trim() });
    setInput("");
  }

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
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {bet.marketTitle}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Users size={10} /> {participants.length}/{bet.maxParticipants}
              <span className="text-gray-300 mx-0.5">·</span>
              <Lock size={9} className="text-purple-500" />
              <span className="text-purple-500">XMTP</span>
              <span className="text-gray-300 mx-0.5">·</span>
              <CountdownTimer expiresAt={bet.expiresAt} />
            </p>
          </div>
          <button
            onClick={async () => {
              const url = `${window.location.origin}${window.location.pathname}?bet=${bet.id}`;
              await navigator.clipboard.writeText(url);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }}
            className={`p-2 rounded-lg transition shrink-0 ${
              linkCopied ? "bg-green-100 text-green-600" : "hover:bg-gray-100 text-gray-500"
            }`}
            title="Copy invite link"
          >
            {linkCopied ? <Check size={18} /> : <Link2 size={18} />}
          </button>
        </div>

        {/* Bet info bar */}
        <div className="flex items-center gap-2 mt-2 bg-gray-50 rounded-lg px-3 py-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              bet.position === "YES"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {bet.position}
          </span>
          <span className="text-xs text-gray-500">Up to ${bet.maxStake}/person</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 capitalize">{bet.type}</span>
          <span className="text-xs font-medium text-gray-700 ml-auto font-numbers">
            Pot: ${pot}
          </span>
        </div>
      </div>

      {/* Participant strip */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <div className="flex -space-x-1.5 shrink-0">
          {participants.slice(0, 8).map((p) => (
            <div
              key={p.userId}
              className={`w-6 h-6 rounded-full ${avatarColor(p.userId)} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white`}
              title={`${p.userId} — $${p.stake}`}
            >
              {p.userId.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
        {participants.length > 8 && (
          <span className="text-[11px] text-gray-400 ml-1 shrink-0">
            +{participants.length - 8}
          </span>
        )}
        <span className="text-[11px] text-gray-400 ml-2 shrink-0">
          {participants.length}/{bet.maxParticipants} in the squad
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserId;
          const isSystem = msg.sender === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-gray-200/70 rounded-full px-3 py-1 flex items-center gap-1.5">
                  <Clock size={10} className="text-gray-400" />
                  <span className="text-[11px] text-gray-500">{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <div
                    className={`w-7 h-7 rounded-full ${avatarColor(msg.sender)} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-auto`}
                  >
                    {msg.sender.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  {!isMe && (
                    <p className="text-[11px] text-gray-400 mb-0.5 ml-1">
                      {msg.sender}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-purple-500 text-white rounded-br-md"
                        : "bg-white border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-[11px] mt-1 ${
                        isMe ? "text-purple-200" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Join banner or input bar */}
      {!isJoined && !isExpired && !isFull ? (
        <div className="border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {payError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
              {payError}
            </div>
          )}
          <div className="bg-purple-50 rounded-xl p-3">
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
          <button
            onClick={handleJoin}
            disabled={isPaying}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
              isPaying
                ? "bg-purple-300 text-white cursor-wait"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {isPaying ? "Processing payment..." : `I'm in — $${joinStake} 🤝`}
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isExpired ? "Time's up" : "Message..."}
            disabled={isExpired}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isExpired}
            className={`p-2.5 rounded-xl transition ${
              input.trim() && !isExpired
                ? "bg-purple-500 text-white hover:bg-purple-600 active:scale-[0.95]"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
