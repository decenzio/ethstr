import { NextRequest, NextResponse } from "next/server";
import { nostrServiceServer } from "~~/services/nostrService.server";
import { NostrServiceError } from "~~/services/nostrService.types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ npub: string }> }) {
  try {
    const { npub } = await params;
    const { searchParams } = new URL(req.url);
    const chainId = searchParams.get("chainId");

    // Validate npub parameter
    if (!npub || npub.trim() === "") {
      return NextResponse.json({ error: "Missing or empty npub parameter" }, { status: 400 });
    }

    // Validate chainId parameter
    if (!chainId || chainId.trim() === "") {
      return NextResponse.json({ error: "Missing chainId parameter" }, { status: 400 });
    }

    const targetChainId = parseInt(chainId, 10);
    if (isNaN(targetChainId) || targetChainId <= 0) {
      return NextResponse.json({ error: "Invalid chainId parameter. Must be a positive integer." }, { status: 400 });
    }

    // Get EVM address using the server service
    const address = await nostrServiceServer.getEthAddress(npub, targetChainId);

    if (!address) {
      return NextResponse.json({ error: "Failed to resolve EVM address" }, { status: 404 });
    }

    return NextResponse.json({ "EVM-address": address });
  } catch (err) {
    console.error("API Error:", err);

    // Handle specific NostrServiceError instances
    if (err instanceof NostrServiceError) {
      const statusCode =
        err.code === "INVALID_INPUT" || err.code === "INVALID_NPUB" || err.code === "INVALID_CHAIN_ID" ? 400 : 500;

      return NextResponse.json({ error: err.message, code: err.code }, { status: statusCode });
    }

    // Handle generic errors
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
