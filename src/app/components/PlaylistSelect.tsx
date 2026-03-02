import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function PlaylistSelect() {
  const navigate = useNavigate();

  const playlists = [
    { name: "Deep Focus", duration: "25/5" },
    { name: "Power Mode", duration: "50/10" },
    { name: "Long Session", duration: "90/20" },
    { name: "Custom Mix", duration: null },
  ];

  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastPlayedPlaylist");
    setLastPlayed(saved); // null이면 그대로 null
  }, []);

  const handleSelect = (playlist: { name: string; duration: string | null }) => {
    localStorage.setItem("lastPlayedPlaylist", playlist.name);
    setLastPlayed(playlist.name); // UI 즉시 반영
    navigate("/setup", { state: { playlist } });
  };

  return (
    <div className="h-full flex flex-col px-6 py-12">
      {/* Hidden SVG filter for hand-drawn effect */}
      <svg id="hand-drawn-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="hand-drawn-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Title */}
      <h1 className="mb-8 text-center">Your Playlists</h1>

      {/* Playlist Cards */}
      <div className="hand-drawn-border bg-white mb-8 flex-1 max-h-[400px]">
        {playlists.map((playlist, index) => (
          <div key={playlist.name}>
            <button
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-black/5 transition-colors"
              onClick={() => navigate("/setup", { state: { playlist } })}
            >
              <span className="text-black">{playlist.name}</span>
              {playlist.duration && (
                <span className="text-black/40 text-sm">{playlist.duration}</span>
              )}
            </button>
            {index < playlists.length - 1 && <div className="h-[1px] bg-black/10 mx-6" />}
          </div>
        ))}
      </div>

      {/* Last Played Text */}
      <p className="text-sm text-black/40 text-center">
        Last played: {lastPlayed ?? "None yet"}
      </p>
    </div>
  );
}