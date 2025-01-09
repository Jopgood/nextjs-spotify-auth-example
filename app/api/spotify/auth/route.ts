// app/api/spotify/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error("SPOTIFY_CLIENT_ID is not defined");
}

if (!process.env.SPOTIFY_REDIRECT_URI) {
  throw new Error("SPOTIFY_REDIRECT_URI is not defined");
}

const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codeChallenge } = body;

    if (!codeChallenge) {
      return NextResponse.json(
        { error: "Code challenge is required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      response_type: "code",
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      scope: SPOTIFY_SCOPES,
    });

    return NextResponse.json({
      url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    });
  } catch (error) {
    console.error("Error in /api/spotify/auth:", error);
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}
