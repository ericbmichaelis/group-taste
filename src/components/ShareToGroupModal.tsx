import { useEffect, useState } from "react";
import { X, Send, Check, Copy, Link2, Loader2 } from "lucide-react";
import type { GroupBet } from "../store/betStore";
import { getGroups, sendToGroup, type XmtpGroup } from "../api/xmtp";

interface Props {
  bet: GroupBet;
  onClose: () => void;
}

export function ShareToGroupModal({ bet, onClose }: Props) {
  const [groups, setGroups] = useState<XmtpGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const shareLink = `alien.app/miniapp/groupbet?bet=${bet.id}`;

  useEffect(() => {
    getGroups().then((data) => {
      setGroups(data);
      setLoading(false);
    });
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendXmtp() {
    if (!selectedGroupId) return;
    setSending(true);
    await sendToGroup(
      selectedGroupId,
      `Join my take! ${bet.marketTitle} — ${bet.position} | Up to $${bet.maxStake} stake\n${shareLink}`
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
      <div className="animate-slide-up sm:animate-scale-in bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Put your friends on</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">
              {bet.marketTitle}
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
          {/* Bet preview */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                bet.position === "YES"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {bet.position}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {bet.marketTitle}
              </p>
              <p className="text-xs text-gray-500">
                Up to ${bet.maxStake} stake · {bet.participants.length}/{bet.maxParticipants} in
              </p>
            </div>
          </div>

          {/* Link preview */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <Link2 size={14} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 truncate font-mono">
              {shareLink}
            </span>
            <button
              onClick={handleCopy}
              className={`shrink-0 ml-auto p-1.5 rounded-lg transition ${
                copied ? "text-green-600" : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Group selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Send to a squad
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                      selectedGroupId === group.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl shrink-0">
                      {group.emoji}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {group.memberCount} members
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send button */}
          {selectedGroupId && (
            <button
              onClick={handleSendXmtp}
              disabled={sending || sent}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition ${
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
          )}
        </div>
      </div>
    </div>
  );
}
