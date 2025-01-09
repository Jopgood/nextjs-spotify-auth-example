import SpotifyAuth from "@/components/SpotifyAuth";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Spotify Playlist Creator</h1>
          <p className="text-zinc-400 mb-12">
            Connect your Spotify account to create custom playlists
          </p>
          <SpotifyAuth />
        </div>
      </div>
    </main>
  );
}
