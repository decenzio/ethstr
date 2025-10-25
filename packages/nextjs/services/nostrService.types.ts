// TypeScript interfaces for Nostr services
// This ensures type safety and consistent API across client and server

export interface NostrServiceInterface {
  getNostrPubkey(nPub: string): string | null;
  getEthAddress(nPub: string, chainId: number): Promise<string | null>;
}

export interface ClientNostrServiceInterface extends NostrServiceInterface {
  connect(): Promise<string | null>;
  getPubkey(): string | null;
  getNostrNpub(): string | null;
  getEthAddress(nPub: string, chainId: number): Promise<string | null>;
}

export interface ServerNostrServiceInterface extends NostrServiceInterface {
  getEthAddress(nPub: string, chainId: number): Promise<string | null>;
}

// Error types for better error handling
export class NostrServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "NostrServiceError";
  }
}

// Configuration types
export interface NostrServiceConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}
