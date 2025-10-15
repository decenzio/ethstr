import { NextRequest, NextResponse } from "next/server";
import { nostrService } from "~~/services/nostrService";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ npub: string }> }) {
  const { npub } = await params;

  if (!npub) {
    return NextResponse.json({ error: "Missing npub parameter" }, { status: 400 });
  }

  try {
    const addr = await nostrService.getEthAddress(npub);
    return NextResponse.json({ "EVM-address": addr });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to resolve EVM address" }, { status: 500 });
  }
}
