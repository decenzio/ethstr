"use client";

import { useEffect, useState } from "react";
import { connectService } from "~~/services/connectToNetworkService";
import { transactionService } from "~~/services/sendTransactionService";
import { useGlobalState } from "~~/services/store/store";

/**
 * Global hook for managing Nostr connection state across the entire app
 * Handles connection restoration and provides connection status
 */
export const useNostrConnection = () => {
  const [mounted, setMounted] = useState(false);
  const walletAddress = useGlobalState(state => state.walletAddress);
  const nPubkey = useGlobalState(state => state.nPubkey);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Ensure hook is mounted before returning dynamic values
  useEffect(() => {
    setMounted(true);
  }, []);

  const isConnected = !!nPubkey;
  const isAAInitialized = transactionService.isNetworkSupported();
  const needsRestoration = isConnected && !isAAInitialized;

  // Restore connection if we have nPubkey but no AA initialization
  useEffect(() => {
    if (needsRestoration && !isRestoring) {
      setIsRestoring(true);
      setRestoreError(null);

      connectService
        .reinitializeForNewNetwork()
        .then(() => {
          console.log("Connection restored successfully");
        })
        .catch(error => {
          console.error("Failed to restore connection:", error);
          setRestoreError(error.message || "Failed to restore connection");
        })
        .finally(() => {
          setIsRestoring(false);
        });
    }
  }, [needsRestoration, isRestoring]);

  return {
    // Connection state
    isConnected: mounted ? isConnected : false,
    isAAInitialized: mounted ? isAAInitialized : false,
    needsRestoration: mounted ? needsRestoration : false,
    isRestoring: mounted ? isRestoring : false,
    restoreError: mounted ? restoreError : null,

    // Connection data
    walletAddress: mounted ? walletAddress : null,
    nPubkey: mounted ? nPubkey : "",

    // Helper functions
    clearRestoreError: () => setRestoreError(null),
  };
};
