# Next.js Spotify Integration Example

A production-ready example of integrating Spotify's API with Next.js, demonstrating secure authentication flow and state management without relying on next-auth. This project showcases how to implement a "Connect with Spotify" feature rather than using Spotify as a primary authentication provider.

## 🌐 Live Demo

Check out the live example: Coming Soon!

## 📑 Table of Contents
- 🎯 [Key Features](#-key-features)
- 🤔 [Why This Project?](#-why-this-project)
- 🏗️ [Project Structure](#️-project-structure)
- 🚀 [Getting Started](#-getting-started)
- ⚙️ [Environment Variables](#️-environment-variables)
- 🔒 [Security Features](#-security-features)
- 🛠️ [Implementation Details](#️-implementation-details)
  - [Authentication Flow](#authentication-flow)
  - [State Management](#state-management)
- 📚 [Key Differences from Other Examples](#-key-differences-from-other-examples)
- 🤝 [Contributing](#-contributing)
- 📝 [License](#-license)

## 🎯 Key Features

- Complete Spotify OAuth flow implementation using PKCE
- Token management (access & refresh) using Zustand for state persistence
- Secure backend implementation using Next.js API routes
- Example of creating Spotify playlists on behalf of connected users
- No exposure of client secrets to the frontend

## 🤔 Why This Project?

While many Next.js + Spotify examples exist, most focus on creating Spotify clones or use next-auth's Spotify provider. This project fills a different need: implementing Spotify as a secondary connection option where users:

1. Can authenticate to your app independently (e.g., email/password)
2. Have the option to connect their Spotify account later
3. Can perform Spotify actions (e.g., create playlists) once connected

## 🏗️ Project Structure

```
app/
├── api/spotify/        # Spotify API endpoints
│   ├── auth/          # Authentication handlers
│   ├── refresh/       # Token refresh logic
│   └── token/         # Token management
├── components/
│   ├── ui/           # UI components
│   └── SpotifyAuth.tsx # Spotify authentication component
├── lib/
│   ├── pkce.ts       # PKCE helper utilities
│   └── utils.ts      # General utilities
└── store/spotify/    # Zustand store for Spotify state
    ├── index.ts
    └── types.ts
```

## 🚀 Getting Started

1. Clone this repository
2. Set up your Spotify Application:
   - Follow the [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api) to create and configure your application
   - Add `http://localhost:3000` to your Redirect URIs in the app settings
   - Note down your Client ID and Client Secret
3. Copy `.env.example` to `.env.local` and fill in your Spotify API credentials
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables

```env
# Development: http://localhost:3000
# Production: https://your-domain.com
SPOTIFY_REDIRECT_URI=

SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

## 🔒 Security Features

- All sensitive operations happen server-side via API routes
- PKCE (Proof Key for Code Exchange) implementation for enhanced security
- No client secrets exposed to the frontend
- Secure token management and refresh handling

## 🛠️ Implementation Details

### Authentication Flow

1. User initiates Spotify connection
2. PKCE challenge is generated
3. User is redirected to Spotify consent screen
4. Authorization code is received and exchanged for tokens
5. Tokens are stored in Zustand store with persistence

### State Management

- Zustand is used for frontend state management
- Persistent storage of authentication state
- Automatic token refresh handling

## 📚 Key Differences from Other Examples

- No dependency on next-auth
- Complete control over the authentication flow
- Separation of primary app authentication from Spotify integration
- Production-ready security considerations
- Clear separation of frontend and backend concerns

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT

---

Built with ❤️ to help developers implement Spotify integration properly
