import { useState } from "react";
import { X, Users, DollarSign, MessageCircle, Check, Link2, Copy } from "lucide-react";
import type { KalshiMarket } from "../api/kalshi";
import { useBetStore, type GroupBet } from "../store/betStore";
import { useAppStore } from "../lib/store";

interface Props {
  market: KalshiMarket;
  onClose: () => void;
}

export function CreateBetModal({ market, onClose }: Props) {
  const createBet = useBetStore((s) => s.createBet);
  const currentUserId = useBetStore((s) => s.currentUserId);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [position, setPosition] = useState<"YES" | "NO">("YES");
  const [maxStake, setMaxStake] = useState(50);
  const [creatorStake, setCreatorStake] = useState(25);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [betType, setBetType] = useState<"public" | "private">("public");
  const [created, setCreated] = useState<GroupBet | null>(null);

  const handleCreate = () => {
    const newBet = createBet({
      ticker: market.ticker,
      marketTitle: market.title,
      eventTitle: market.event_title,
      position,
      minStake: 1,
      maxStake,
      maxParticipants,
      type: betType,
      participants: [{ userId: currentUserId, stake: creatorStake }],
      createdBy: currentUserId,
      yesBid: market.yes_bid,
      noBid: market.no_bid,
    });
    setCreated(newBet);
  };

  const handleGoToGroup = () => {
    onClose();
    setActiveTab("groups");
  };

  // Success screen
  if (created) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Take locked in! 🔒
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Squad chat is live
            </p>
            <p className="text-xs text-gray-400 mb-6">
              {created.maxParticipants} spots · Open for 1 hour · {created.type === "public" ? "Anyone can join" : "Invite only"}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    created.position === "YES"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {created.position}
                </span>
                <span className="text-xs text-gray-500">Up to ${created.maxStake}/person</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{created.marketTitle}</p>
            </div>

            {/* Invite link */}
            <InviteLink betId={created.id} />

            <div className="space-y-2">
              <button
                onClick={handleGoToGroup}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] transition"
              >
                <MessageCircle size={16} />
                Hit the group chat 💬
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="animate-slide-up sm:animate-scale-in bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Lock in your take 🔒</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Market Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {market.category}
            </span>
            <p className="font-semibold text-gray-900 text-sm mt-2">
              {market.title}
            </p>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your take
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPosition("YES")}
                className={`py-3 rounded-xl font-semibold text-sm transition ${
                  position === "YES"
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                YES {(market.yes_bid * 100).toFixed(0)}¢
              </button>
              <button
                onClick={() => setPosition("NO")}
                className={`py-3 rounded-xl font-semibold text-sm transition ${
                  position === "NO"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                NO {(market.no_bid * 100).toFixed(0)}¢
              </button>
            </div>
          </div>

          {/* Stake */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={14} className="inline -mt-0.5" /> Stake per person
            </label>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Max stake</span>
                  <span className="text-sm font-semibold text-gray-900 font-numbers">${maxStake}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={500}
                  value={maxStake}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxStake(val);
                    if (creatorStake > val) setCreatorStake(val);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-700">Your stake</span>
                  <span className="text-sm font-bold text-purple-700 font-numbers">${creatorStake}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={maxStake}
                  value={creatorStake}
                  onChange={(e) => setCreatorStake(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users size={14} className="inline -mt-0.5" /> Squad size
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              min={2}
              max={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Bet Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Who can join?
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                  betType === "public"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={betType === "public"}
                  onChange={() => setBetType("public")}
                  className="accent-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Public</p>
                  <p className="text-xs text-gray-500">Any real one can join</p>
                </div>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                  betType === "private"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={betType === "private"}
                  onChange={() => setBetType("private")}
                  className="accent-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Private</p>
                  <p className="text-xs text-gray-500">Squad only</p>
                </div>
              </label>
            </div>
          </div>

          {/* XMTP group info */}
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-3 rounded-xl text-sm">
            <MessageCircle size={16} />
            <span>Creates a squad chat on XMTP (1 hour)</span>
          </div>

          {/* Pot Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">Max pot size</p>
            <p className="text-2xl font-bold text-gray-900 font-numbers">
              ${maxStake * maxParticipants}
            </p>
            <p className="text-xs text-gray-500">
              Up to ${maxStake} x {maxParticipants} people
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] transition"
          >
            Lock it in — ${creatorStake} stake 🔒
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteLink({ betId }: { betId: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}?bet=${betId}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
      <Link2 size={14} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-500 truncate font-mono flex-1">{url}</span>
      <button
        onClick={handleCopy}
        className={`shrink-0 p-1.5 rounded-lg transition ${
          copied ? "text-green-600" : "text-gray-400 hover:bg-gray-200"
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
