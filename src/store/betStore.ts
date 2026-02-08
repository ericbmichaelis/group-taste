import { create } from "zustand";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isBetShare?: boolean;
}

export interface ParticipantEntry {
  userId: string;
  stake: number;
}

export type BetStatus = "open" | "expired" | "resolved";

export interface GroupBet {
  id: string;
  ticker: string;
  marketTitle: string;
  eventTitle: string;
  position: "YES" | "NO";
  minStake: number;
  maxStake: number;
  maxParticipants: number;
  type: "public" | "private";
  participants: ParticipantEntry[];
  createdAt: number;
  expiresAt: number;
  createdBy: string;
  groupWallet: string;
  yesBid: number;
  noBid: number;
  xmtpGroupId: string;
  messages: ChatMessage[];
  status: BetStatus;
  result: "YES" | "NO" | null;
  resolvedAt: number | null;
}

interface BetStore {
  bets: GroupBet[];
  currentUserId: string;
  createBet: (
    bet: Omit<GroupBet, "id" | "createdAt" | "expiresAt" | "groupWallet" | "xmtpGroupId" | "messages" | "status" | "result" | "resolvedAt">
  ) => GroupBet;
  joinBet: (betId: string, userId: string, stake: number) => void;
  addMessage: (betId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void;
  resolveBet: (betId: string, result: "YES" | "NO") => void;
  getActiveBets: () => GroupBet[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function generateWallet() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let addr = "";
  for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

export function calcPayout(bet: GroupBet, participant: ParticipantEntry): number {
  if (!bet.result) return 0;
  const won = bet.result === bet.position;
  if (!won) return 0;
  const price = bet.position === "YES" ? bet.yesBid : bet.noBid;
  if (price <= 0) return participant.stake;
  return Math.round((participant.stake / price) * 100) / 100;
}

export const useBetStore = create<BetStore>((set, get) => ({
  bets: [],
  currentUserId: "user_123",

  createBet: (bet) => {
    const now = Date.now();
    const betId = generateId();
    const newBet: GroupBet = {
      ...bet,
      id: betId,
      createdAt: now,
      expiresAt: now + 3600000, // 1 hour
      groupWallet: generateWallet(),
      xmtpGroupId: `xmtp-group-${betId}`,
      status: "open",
      result: null,
      resolvedAt: null,
      messages: [
        {
          id: `sys-${betId}`,
          sender: "system",
          text: `Group bet created! ${bet.position} on "${bet.marketTitle}" — Up to $${bet.maxStake}/person, ${bet.maxParticipants} max. Open for 1 hour.`,
          timestamp: now,
        },
      ],
    };
    set((state) => ({ bets: [newBet, ...state.bets] }));
    return newBet;
  },

  joinBet: (betId, userId, stake) => {
    const now = Date.now();
    set((state) => ({
      bets: state.bets.map((bet) =>
        bet.id === betId &&
        bet.status === "open" &&
        !bet.participants.some((p) => p.userId === userId) &&
        bet.participants.length < bet.maxParticipants &&
        now < bet.expiresAt
          ? {
              ...bet,
              participants: [...bet.participants, { userId, stake }],
              messages: [
                ...bet.messages,
                {
                  id: `join-${now}`,
                  sender: "system",
                  text: `${userId} joined with $${stake} stake!`,
                  timestamp: now,
                },
              ],
            }
          : bet
      ),
    }));
  },

  addMessage: (betId, message) => {
    const now = Date.now();
    set((state) => ({
      bets: state.bets.map((bet) =>
        bet.id === betId
          ? {
              ...bet,
              messages: [
                ...bet.messages,
                { ...message, id: `msg-${now}-${Math.random().toString(36).slice(2, 6)}`, timestamp: now },
              ],
            }
          : bet
      ),
    }));
  },

  resolveBet: (betId, result) => {
    const now = Date.now();
    set((state) => ({
      bets: state.bets.map((bet) => {
        if (bet.id !== betId || bet.status === "resolved") return bet;
        const won = result === bet.position;
        const pot = bet.participants.reduce((s, p) => s + p.stake, 0);
        return {
          ...bet,
          status: "resolved" as BetStatus,
          result,
          resolvedAt: now,
          messages: [
            ...bet.messages,
            {
              id: `resolve-${now}`,
              sender: "system",
              text: won
                ? `Market resolved ${result}! The group WON! Pot: $${pot}`
                : `Market resolved ${result}. The group lost. Better luck next time!`,
              timestamp: now,
            },
          ],
        };
      }),
    }));
  },

  getActiveBets: () => {
    const now = Date.now();
    return get().bets.filter((b) => b.status === "open" && now < b.expiresAt);
  },
}));
