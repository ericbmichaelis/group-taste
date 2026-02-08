import { useState, useMemo } from "react";
import { X, Link2, Send, Check, Copy } from "lucide-react";
import { useBetStore } from "../store/betStore";
import { sendToGroup, type XmtpGroup } from "../api/xmtp";

interface Props {
  group: XmtpGroup;
  onClose: () => void;
}

export function ShareBetModal({ group, onClose }: Props) {
  const allBets = useBetStore((s) => s.bets);
  const currentUserId = useBetStore((s) => s.currentUserId);
  const activeBets = useMemo(
    () => allBets.filter((b) => Date.now() < b.expiresAt),
    [allBets]
  );

  const [selectedBetId, setSelectedBetId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedBet = activeBets.find((b) => b.id === selectedBetId);
  const shareLink = selectedBetId
    ? `alien.app/miniapp/groupbet?bet=${selectedBetId}`
    : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendXmtp() {
    if (!selectedBet) return;
    setSending(true);
    await sendToGroup(
      group.id,
      `🔥 Join my take! ${selectedBet.marketTitle} — ${selectedBet.position} | Up to $${selectedBet.maxStake} stake\n${shareLink}`
    );
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Share a take</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              to {group.emoji} {group.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {activeBets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No active takes to share</p>
              <p className="text-xs mt-1">Lock in a take first from Markets</p>
            </div>
          ) : (
            <>
              {/* Bet selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pick a take to share
                </label>
                <div className="space-y-2">
                  {activeBets.map((bet) => {
                    const isCreator = bet.createdBy === currentUserId;
                    return (
                      <button
                        key={bet.id}
                        onClick={() => setSelectedBetId(bet.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition ${
                          selectedBetId === bet.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {bet.marketTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              bet.position === "YES"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {bet.position}
                          </span>
                          <span className="text-xs text-gray-500">
                            Up to ${bet.maxStake} stake
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">
                            {bet.participants.length}/{bet.maxParticipants}
                          </span>
                          {isCreator && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium ml-auto">
                              Your take
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Share link + actions */}
              {selectedBetId && (
                <div className="space-y-3">
                  {/* Link preview */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                    <Link2 size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 truncate font-mono">
                      {shareLink}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
                        copied
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={16} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSendXmtp}
                      disabled={sending || sent}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
                        sent
                          ? "bg-green-500 text-white"
                          : sending
                            ? "bg-purple-400 text-white cursor-wait"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-[0.97]"
                      }`}
                    >
                      {sent ? (
                        <>
                          <Check size={16} /> Sent!
                        </>
                      ) : sending ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send size={16} /> Send it 🚀
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
