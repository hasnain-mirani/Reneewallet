export {};

declare global {
  interface Window {
    // Solana
    solana?: any;
    phantom?: { solana?: any };

    // TRON
    tronLink?: {
      ready?: boolean;
      tronWeb?: any;
      request?: (args: { method: string }) => Promise<any>;
    };
    tronWeb?: any;
  }

  interface ImportMetaEnv {
    readonly VITE_SOLANA_RPC?: string;
    readonly VITE_TRON_FULLHOST?: string;
  }
}
