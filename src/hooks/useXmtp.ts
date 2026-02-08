import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { xmtpService } from "../api/xmtp";

const STORAGE_KEY = "groupbet-xmtp-key";

function getOrCreateWallet() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return new ethers.Wallet(stored);
  }
  const wallet = ethers.Wallet.createRandom();
  localStorage.setItem(STORAGE_KEY, wallet.privateKey);
  return wallet;
}

export function useXmtp() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (xmtpService.isConnected) {
        setIsConnected(true);
        return;
      }

      setIsConnecting(true);
      const wallet = getOrCreateWallet();
      setAddress(wallet.address);

      const signMessage = async (message: string): Promise<Uint8Array> => {
        const sig = await wallet.signMessage(message);
        return ethers.getBytes(sig);
      };

      const client = await xmtpService.connect(wallet.address, signMessage);

      if (!cancelled) {
        setIsConnected(!!client);
        setIsConnecting(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return { isConnected, isConnecting, address, xmtpService };
}
