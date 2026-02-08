import { Client, type Signer, IdentifierKind } from "@xmtp/browser-sdk";

// ── Types ──────────────────────────────────────────────────
export interface XmtpGroup {
  id: string;
  name: string;
  memberCount: number;
  lastMessage: string;
  timestamp: number;
  emoji: string;
}

export interface XmtpMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isBetShare?: boolean;
  betId?: string;
}

// ── XMTP Service ───────────────────────────────────────────
class XmtpService {
  private client: Client | null = null;
  private _isConnected = false;

  get isConnected() {
    return this._isConnected;
  }

  async connect(walletAddress: string, signMessage: (msg: string) => Promise<Uint8Array>) {
    try {
      const signer: Signer = {
        type: "EOA",
        getIdentifier: () => ({
          identifier: walletAddress,
          identifierKind: IdentifierKind.Ethereum,
        }),
        signMessage,
      };

      this.client = await Client.create(signer, {
        env: "dev",
        appVersion: "groupbet/1.0",
      });

      this._isConnected = true;
      console.log("[XMTP] Connected as", walletAddress);
      return this.client;
    } catch (err) {
      console.warn("[XMTP] Failed to connect, using mock mode:", err);
      this._isConnected = false;
      return null;
    }
  }

  async createGroup(name: string, memberInboxIds: string[]) {
    if (!this.client) {
      console.log("[XMTP Mock] createGroup:", name);
      return { id: `mock-group-${Date.now()}` };
    }

    const group = await this.client.conversations.createGroup(memberInboxIds, {
      groupName: name,
      groupDescription: `Group Taste: ${name}`,
    } as Record<string, unknown>);

    return { id: group.id };
  }

  async sendMessage(groupId: string, text: string) {
    if (!this.client) {
      console.log("[XMTP Mock] sendMessage to", groupId, ":", text);
      return;
    }

    const conversations = await this.client.conversations.list();
    const group = conversations.find((c) => c.id === groupId);
    if (group) {
      await group.sendText(text);
    }
  }

  async getMessages(groupId: string) {
    if (!this.client) {
      return [];
    }

    const conversations = await this.client.conversations.list();
    const group = conversations.find((c) => c.id === groupId);
    if (!group) return [];

    const messages = await group.messages();
    return messages.map((m) => ({
      id: m.id,
      sender: m.senderInboxId,
      text: String(m.content ?? ""),
      timestamp: Number(m.sentAtNs) / 1_000_000,
    }));
  }

  disconnect() {
    this.client = null;
    this._isConnected = false;
  }
}

export const xmtpService = new XmtpService();

// ── Mock helpers (used by ShareToGroupModal & ShareBetModal) ──
const mockGroups: XmtpGroup[] = [
  { id: "1", name: "Tech Friends", memberCount: 12, lastMessage: "Let's bet on the game tonight", timestamp: Date.now() - 120000, emoji: "💻" },
  { id: "2", name: "Crypto Degens", memberCount: 8, lastMessage: "Who's in for the election market?", timestamp: Date.now() - 300000, emoji: "🪙" },
  { id: "3", name: "Sports Squad", memberCount: 15, lastMessage: "Lakers bet is live!", timestamp: Date.now() - 600000, emoji: "🏀" },
  { id: "4", name: "Office Pool", memberCount: 6, lastMessage: "Added $20 to the Oscars bet", timestamp: Date.now() - 1800000, emoji: "🏢" },
  { id: "5", name: "College Crew", memberCount: 20, lastMessage: "New market just dropped", timestamp: Date.now() - 3600000, emoji: "🎓" },
];

export async function getGroups(): Promise<XmtpGroup[]> {
  await new Promise((r) => setTimeout(r, 300));
  return mockGroups;
}

export async function sendToGroup(_groupId: string, _message: string): Promise<void> {
  if (xmtpService.isConnected) {
    await xmtpService.sendMessage(_groupId, _message);
  } else {
    await new Promise((r) => setTimeout(r, 500));
  }
}
