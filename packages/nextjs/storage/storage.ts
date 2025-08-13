import { SupportedChain, getDefaultChain, getSupportedChains } from "../../../chains.config";

// Storage key for selected chain
const SELECTED_CHAIN_KEY = "ethstr_selected_chain";

// Browser storage interface
interface ChainStorage {
  getSelectedChain(): SupportedChain;
  setSelectedChain(chainName: SupportedChain): void;
  clearSelectedChain(): void;
  isChainSupported(chainName: string): boolean;
  getAllSupportedChains(): SupportedChain[];
}

// Local storage implementation
class LocalChainStorage implements ChainStorage {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  getSelectedChain(): SupportedChain {
    if (!this.isClient()) {
      return getDefaultChain();
    }

    try {
      const stored = localStorage.getItem(SELECTED_CHAIN_KEY);
      if (stored && this.isChainSupported(stored)) {
        return stored as SupportedChain;
      }
    } catch (error) {
      console.warn("Failed to read selected chain from localStorage:", error);
    }

    return getDefaultChain();
  }

  setSelectedChain(chainName: SupportedChain): void {
    if (!this.isClient()) {
      console.warn("Cannot set selected chain on server side");
      return;
    }

    if (!this.isChainSupported(chainName)) {
      throw new Error(`Unsupported chain: ${chainName}`);
    }

    try {
      localStorage.setItem(SELECTED_CHAIN_KEY, chainName);
    } catch (error) {
      console.error("Failed to save selected chain to localStorage:", error);
      throw error;
    }
  }

  clearSelectedChain(): void {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.removeItem(SELECTED_CHAIN_KEY);
    } catch (error) {
      console.error("Failed to clear selected chain from localStorage:", error);
    }
  }

  isChainSupported(chainName: string): boolean {
    return getSupportedChains().includes(chainName as SupportedChain);
  }

  getAllSupportedChains(): SupportedChain[] {
    return getSupportedChains();
  }
}

// Session storage implementation (alternative for session-based persistence)
class SessionChainStorage implements ChainStorage {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  getSelectedChain(): SupportedChain {
    if (!this.isClient()) {
      return getDefaultChain();
    }

    try {
      const stored = sessionStorage.getItem(SELECTED_CHAIN_KEY);
      if (stored && this.isChainSupported(stored)) {
        return stored as SupportedChain;
      }
    } catch (error) {
      console.warn("Failed to read selected chain from sessionStorage:", error);
    }

    return getDefaultChain();
  }

  setSelectedChain(chainName: SupportedChain): void {
    if (!this.isClient()) {
      console.warn("Cannot set selected chain on server side");
      return;
    }

    if (!this.isChainSupported(chainName)) {
      throw new Error(`Unsupported chain: ${chainName}`);
    }

    try {
      sessionStorage.setItem(SELECTED_CHAIN_KEY, chainName);
    } catch (error) {
      console.error("Failed to save selected chain to sessionStorage:", error);
      throw error;
    }
  }

  clearSelectedChain(): void {
    if (!this.isClient()) {
      return;
    }

    try {
      sessionStorage.removeItem(SELECTED_CHAIN_KEY);
    } catch (error) {
      console.error("Failed to clear selected chain from sessionStorage:", error);
    }
  }

  isChainSupported(chainName: string): boolean {
    return getSupportedChains().includes(chainName as SupportedChain);
  }

  getAllSupportedChains(): SupportedChain[] {
    return getSupportedChains();
  }
}

// In-memory storage implementation (fallback for SSR or when storage is unavailable)
class MemoryChainStorage implements ChainStorage {
  private selectedChain: SupportedChain = getDefaultChain();

  getSelectedChain(): SupportedChain {
    return this.selectedChain;
  }

  setSelectedChain(chainName: SupportedChain): void {
    if (!this.isChainSupported(chainName)) {
      throw new Error(`Unsupported chain: ${chainName}`);
    }

    this.selectedChain = chainName;
  }

  clearSelectedChain(): void {
    this.selectedChain = getDefaultChain();
  }

  isChainSupported(chainName: string): boolean {
    return getSupportedChains().includes(chainName as SupportedChain);
  }

  getAllSupportedChains(): SupportedChain[] {
    return getSupportedChains();
  }
}

// Storage factory
export function createChainStorage(type: "localStorage" | "sessionStorage" | "memory" = "localStorage"): ChainStorage {
  switch (type) {
    case "localStorage":
      return new LocalChainStorage();
    case "sessionStorage":
      return new SessionChainStorage();
    case "memory":
      return new MemoryChainStorage();
    default:
      return new LocalChainStorage();
  }
}

// Default storage instance
export const chainStorage = createChainStorage("localStorage");

// Utility functions
export function getSelectedChain(): SupportedChain {
  return chainStorage.getSelectedChain();
}

export function setSelectedChain(chainName: SupportedChain): void {
  chainStorage.setSelectedChain(chainName);
}

export function clearSelectedChain(): void {
  chainStorage.clearSelectedChain();
}

export function isChainSupported(chainName: string): boolean {
  return chainStorage.isChainSupported(chainName);
}

export function getAllSupportedChains(): SupportedChain[] {
  return chainStorage.getAllSupportedChains();
}

// Types for export
export type { ChainStorage };
export { LocalChainStorage, SessionChainStorage, MemoryChainStorage };
