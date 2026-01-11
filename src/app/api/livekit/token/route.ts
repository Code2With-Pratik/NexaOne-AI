import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  // 1. Get query params
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');

  if (!room) return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 });

  // 2. Get User Info
  const user = await currentUser();
  const participantName = username || user?.fullName || 'Guest';
  const participantId = user?.id || Math.random().toString(36).slice(2);

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // 3. Generate Token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
  });

  at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

  // 4. Return the JWT String inside an object
  const jwt = await at.toJwt(); // await is safe here just in case

  return NextResponse.json({ token: jwt });
}