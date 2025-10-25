"use client";

import { useNostrConnection } from "~~/hooks/useNostrConnection";

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  variant?: "default" | "compact" | "minimal";
}

export const ConnectionStatus = ({
  className = "",
  showDetails = true,
  variant = "default",
}: ConnectionStatusProps) => {
  const { isConnected, isAAInitialized, isRestoring, restoreError, walletAddress, nPubkey } = useNostrConnection();

  if (!isConnected) return null;

  const getStatusColor = () => {
    if (isRestoring) return "bg-yellow-500";
    if (isAAInitialized) return "bg-green-500";
    return "bg-yellow-500";
  };

  const getStatusText = () => {
    if (isRestoring) return "Restoring connection...";
    if (isAAInitialized) return "Connected";
    return "Connection in progress";
  };

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-xs">{getStatusText()}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`p-3 bg-base-200 rounded-lg border border-base-300 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <div className="flex-1">
            <p className="text-sm font-medium">{getStatusText()}</p>
            {showDetails && nPubkey && (
              <p className="text-xs text-base-content/70 font-mono">
                {nPubkey.slice(0, 12)}...{nPubkey.slice(-8)}
              </p>
            )}
          </div>
        </div>
        {restoreError && <div className="mt-2 text-xs text-error">{restoreError}</div>}
      </div>
    );
  }

  return (
    <div className={`p-4 bg-base-200 rounded-lg border border-base-300 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <div className="flex-1">
          <p className="text-sm font-medium">{getStatusText()}</p>
          {showDetails && nPubkey && (
            <p className="text-xs text-base-content/70 font-mono">
              {nPubkey.slice(0, 12)}...{nPubkey.slice(-8)}
            </p>
          )}
          {showDetails && walletAddress && (
            <p className="text-xs text-base-content/70 font-mono">
              Smart Account: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>
      </div>
      {restoreError && <div className="mt-2 text-xs text-error">{restoreError}</div>}
    </div>
  );
};
