import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateCodeChallenge, generateCodeVerifier } from "@/lib/pkce";

interface SpotifyState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;

  getAuthUrl: () => Promise<string>;
  handleAuthCode: (code: string) => Promise<void>;
  clearAuth: () => void;
  setTokens: (tokens: SpotifyTokens) => void;
  setUserId: (userId: string) => void;
  isTokenExpired: () => boolean;
  refreshAccessToken: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<any>;
}

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const useSpotifyStore = create<SpotifyState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userId: null,
      isLoading: false,
      error: null,

      getAuthUrl: async () => {
        try {
          // Generate and store code verifier before making the request
          const codeVerifier = generateCodeVerifier();

          // Store in localStorage with a timestamp
          const verifierData = {
            verifier: codeVerifier,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            "spotify_verifier",
            JSON.stringify(verifierData)
          );

          const codeChallenge = await generateCodeChallenge(codeVerifier);

          const response = await fetch("/api/spotify/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              codeChallenge,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get auth URL");
          }

          const { url } = await response.json();
          return url;
        } catch (error) {
          set({ error: "Failed to generate auth URL" });
          throw error;
        }
      },

      handleAuthCode: async (code: string) => {
        try {
          // Get stored verifier data
          const storedVerifierData = localStorage.getItem("spotify_verifier");
          if (!storedVerifierData) {
            throw new Error("No code verifier found");
          }

          const { verifier, timestamp } = JSON.parse(storedVerifierData);

          // Check if verifier is too old (e.g., older than 5 minutes)
          if (Date.now() - timestamp > 5 * 60 * 1000) {
            localStorage.removeItem("spotify_verifier");
            throw new Error("Code verifier expired");
          }

          set({ isLoading: true });

          const response = await fetch("/api/spotify/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              codeVerifier: verifier,
            }),
          });

          if (!response.ok) {
            throw new Error("Token exchange failed");
          }

          const tokens = await response.json();
          get().setTokens(tokens);

          // Clean up verifier after successful use
          localStorage.removeItem("spotify_verifier");

          // Fetch user profile
          const profileResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!profileResponse.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const profile = await profileResponse.json();
          set({ userId: profile.id });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Authentication failed",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearAuth: () => {
        localStorage.removeItem("spotify_verifier");
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          userId: null,
          error: null,
        });
      },

      setTokens: (tokens: SpotifyTokens) => {
        const expiresAt = Date.now() + tokens.expires_in * 1000;
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt,
          error: null,
        });
      },

      setUserId: (userId: string) => set({ userId }),

      isTokenExpired: () => {
        const expiresAt = get().expiresAt;
        if (!expiresAt) return true;
        return Date.now() > expiresAt - 60000; // 1 minute buffer
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          set({ error: "No refresh token available" });
          throw new Error("No refresh token available");
        }

        try {
          const response = await fetch("/api/spotify/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const tokens = await response.json();
          get().setTokens(tokens);
        } catch (error) {
          set({ error: "Failed to refresh token" });
          get().clearAuth();
          throw error;
        }
      },

      createPlaylist: async (
        name = "My Playlist",
        description = "Created with Spotify Integration"
      ) => {
        const store = get();
        const { accessToken, userId, isTokenExpired } = store;

        if (!accessToken || !userId) {
          throw new Error("Authentication required to create a playlist");
        }

        if (isTokenExpired()) {
          await store.refreshAccessToken();
        }

        try {
          const response = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${store.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name.trim() || "My Playlist",
                description:
                  description.trim() || "Created with Spotify Integration",
                public: false,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Failed to create playlist: ${
                errorData.error?.message || response.statusText
              }`
            );
          }

          return response.json();
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error(
                "An unexpected error occurred while creating the playlist"
              );
        }
      },
    }),
    {
      name: "spotify-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        userId: state.userId,
      }),
    }
  )
);
