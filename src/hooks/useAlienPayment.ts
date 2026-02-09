import { usePayment } from '@alien_org/react';

const PROVIDER_ADDRESS = '0000000204000000000044f7b8d84199';

export type PayToken = 'ALIEN' | 'SOL' | 'USDC';

export const PAY_TOKENS: { id: PayToken; label: string; network: string }[] = [
  { id: 'ALIEN', label: 'ALIEN', network: 'alien' },
  { id: 'SOL', label: 'SOL', network: 'solana' },
  { id: 'USDC', label: 'USDC', network: 'solana' },
];

export function useAlienPayment() {
  const {
    pay,
    status,
    isLoading,
    isPaid,
    isCancelled,
    isFailed,
    txHash,
    errorCode,
    error,
    reset,
    supported,
  } = usePayment();

  async function payForBet(betId: string, stake: number, marketTitle: string, token: PayToken = 'ALIEN') {
    // Skip payment when bridge isn't available (local dev in browser)
    if (!supported) {
      return { status: 'paid' as const };
    }
    const tokenConfig = PAY_TOKENS.find((t) => t.id === token)!;
    const invoice = `bet-${betId}-${Date.now()}`;
    return pay({
      recipient: PROVIDER_ADDRESS,
      amount: String(stake),
      token: tokenConfig.id,
      network: tokenConfig.network,
      invoice,
      item: {
        title: marketTitle,
        iconUrl: `${window.location.origin}/favicon.ico`,
        quantity: 1,
      },
      test: 'paid',
    });
  }

  return {
    payForBet,
    status,
    isLoading,
    isPaid,
    isCancelled,
    isFailed,
    txHash,
    errorCode,
    error,
    reset,
    supported,
  };
}
