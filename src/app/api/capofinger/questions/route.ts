import { NextResponse } from "next/server";
import { getCapofingerSettings } from "@/lib/capofinger";

export const dynamic = "force-dynamic";

export async function GET() {
  const { questions } = await getCapofingerSettings();
  return NextResponse.json({ questions });
}
