interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SpotifyState {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth Methods
  getAuthUrl: () => Promise<string>;
  handleAuthCode: (code: string) => Promise<void>;
  clearAuth: () => void;

  // Token Management
  setTokens: (tokens: SpotifyTokens) => void;
  setUserId: (userId: string) => void;
  isTokenExpired: () => boolean;
  refreshAccessToken: () => Promise<void>;

  // API Methods
  fetchUserProfile: () => Promise<void>;
  createPlaylist: (
    name: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<any>;
}
