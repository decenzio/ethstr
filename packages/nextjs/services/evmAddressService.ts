import { type Address } from "viem";
import { getAppChainConfig } from "~~/config/appChains";

export type EvmAddressApiSuccess = { "EVM-address": Address };
export type EvmAddressApiError = { error: string; code?: string };
export type EvmAddressApiResponse = EvmAddressApiSuccess | EvmAddressApiError;

const isSuccessResponse = (data: unknown): data is EvmAddressApiSuccess => {
  if (!data || typeof data !== "object") return false;
  const value = (data as Record<string, unknown>)["EVM-address"];
  return typeof value === "string" && value.startsWith("0x") && value.length === 42;
};

const buildEndpointUrl = (npub: string, chainId: number, apiUrl?: string): string => {
  const path = `/api/v1/EVM/address/${encodeURIComponent(npub)}?chainId=${chainId}`;

  // Use provided apiUrl or get from global state
  let finalApiUrl = apiUrl;
  if (!finalApiUrl) {
    const appChainConfig = getAppChainConfig(chainId);
    finalApiUrl = appChainConfig.apiBaseUrl || "";
  }

  if (!finalApiUrl) {
    // Fallback to relative path for same-origin requests
    return path;
  }

  const trimmed = finalApiUrl.endsWith("/") ? finalApiUrl.slice(0, -1) : finalApiUrl;
  return `${trimmed}${path}`;
};

export const getEvmAddressFromNpub = async (
  npub: string,
  chainId: number,
  options?: { signal?: AbortSignal; apiUrl?: string },
): Promise<Address> => {
  if (!npub) {
    throw new Error("npub is required");
  }

  const url = buildEndpointUrl(npub, chainId, options?.apiUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: options?.signal,
  });

  let data: EvmAddressApiResponse | undefined;
  try {
    data = (await res.json()) as EvmAddressApiResponse;
  } catch {
    throw new Error(`Malformed response from ${url}`);
  }

  if (!res.ok) {
    const errorData = data as EvmAddressApiError;
    const message = errorData?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    // @ts-ignore - Add code property for better error handling
    error.code = errorData?.code;
    throw error;
  }

  if (!isSuccessResponse(data)) {
    throw new Error("Unexpected API response shape");
  }

  return data["EVM-address"];
};

export const tryGetEvmAddressFromNpub = async (
  npub: string,
  chainId: number,
  options?: { signal?: AbortSignal; apiUrl?: string },
): Promise<Address | null> => {
  try {
    return await getEvmAddressFromNpub(npub, chainId, options);
  } catch {
    return null;
  }
};
