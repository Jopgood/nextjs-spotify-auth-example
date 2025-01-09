"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpotifyStore } from "@/store/spotify";
import { Input } from "@/components/ui/input";

export default function SpotifyAuth() {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  const searchParams = useSearchParams();

  const createPlaylist = useSpotifyStore((state) => state.createPlaylist);
  const getAuthUrl = useSpotifyStore((state) => state.getAuthUrl);
  const handleAuthCode = useSpotifyStore((state) => state.handleAuthCode);
  const clearAuth = useSpotifyStore((state) => state.clearAuth);
  const accessToken = useSpotifyStore((state) => state.accessToken);
  const isLoading = useSpotifyStore((state) => state.isLoading);

  const processedCode = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || processedCode.current === code) return;

    const handleAuth = async () => {
      try {
        processedCode.current = code;
        await handleAuthCode(code);

        // Clean up the URL
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("code");
        window.history.replaceState({}, "", currentUrl.toString());
      } catch (error) {
        console.error("Error during authentication:", error);
        clearAuth();
        processedCode.current = null;
      }
    };

    handleAuth();
  }, [searchParams, handleAuthCode, clearAuth]);

  const handleLogin = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error starting auth flow:", error);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      await createPlaylist(playlistName, playlistDescription);

      setIsCreated(true);
      setPlaylistName("");
      setPlaylistDescription("");
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  return (
    <div className="space-y-4">
      {!accessToken ? (
        <Button
          size="lg"
          className="bg-[#1DB954] hover:bg-[#1ed760]"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <Music className="mr-2 h-5 w-5" />
              Connect to Spotify
            </>
          )}
        </Button>
      ) : (
        <div className="flex flex-col">
          <div className="space-y-4">
            <p className="text-green-400">✓ Connected to Spotify</p>
            <Button size="lg" onClick={handleCreatePlaylist}>
              Create New Playlist
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={clearAuth}
              className="ml-4"
            >
              Disconnect
            </Button>
          </div>
          <div className="flex justify-center items-start min-h-screen">
            <div className="flex flex-col items-center pt-5 w-full md:w-1/2">
              <Input
                className="my-2 w-full"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                type="text"
                placeholder="Playlist Name"
              />
              <Input
                className="my-2 w-full"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                type="text"
                placeholder="Playlist Description"
              />
              {isCreated && (
                <p className="text-green-400">✓ Playlist Created!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
