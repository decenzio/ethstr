import { type Address } from "viem";

export type EvmAddressApiSuccess = { "EVM-address": Address };
export type EvmAddressApiError = { error: string };
export type EvmAddressApiResponse = EvmAddressApiSuccess | EvmAddressApiError;

const isSuccessResponse = (data: unknown): data is EvmAddressApiSuccess => {
  if (!data || typeof data !== "object") return false;
  const value = (data as Record<string, unknown>)["EVM-address"];
  return typeof value === "string" && value.startsWith("0x") && value.length === 42;
};

const buildEndpointUrl = (npub: string, baseUrl?: string): string => {
  const path = `/api/v1/EVM/address/${encodeURIComponent(npub)}`;
  if (!baseUrl) return path;
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}${path}`;
};

export const getEvmAddressFromNpub = async (
  npub: string,
  options?: { signal?: AbortSignal; baseUrl?: string },
): Promise<Address> => {
  if (!npub) {
    throw new Error("npub is required");
  }

  const url = buildEndpointUrl(npub, options?.baseUrl);
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
    const message = (data as EvmAddressApiError)?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (!isSuccessResponse(data)) {
    throw new Error("Unexpected API response shape");
  }

  return data["EVM-address"];
};

export const tryGetEvmAddressFromNpub = async (
  npub: string,
  options?: { signal?: AbortSignal; baseUrl?: string },
): Promise<Address | null> => {
  try {
    return await getEvmAddressFromNpub(npub, options);
  } catch {
    return null;
  }
};
