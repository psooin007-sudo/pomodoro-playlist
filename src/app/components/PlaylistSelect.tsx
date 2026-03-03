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
  <div className="h-full flex items-center justify-center px-6 py-12">
    <div className="relative w-full max-w-sm">
      
      {/* 바깥 테두리 이미지 - 세로로 1.2배 늘림 */}
      <img
        src="/pomodoro_imgs/page_outline.webp"
        alt="card border"
        className="w-full h-auto scale-x-[1.1] scale-y-[1.2] origin-top"
      />

      {/* 내용은 이미지 위에 absolute로 올리기 */}
      {/* scale-y-[1.2] 적용된 실제 높이에 맞게 top/bottom 조정 */}
      <div
        className="absolute inset-x-0 top-0 px-6 flex flex-col"
        style={{ height: "120%" }} // scale-y-[1.2]에 맞춰 높이 보정
      >
        {/* SVG filter */}
        <svg id="hand-drawn-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="hand-drawn-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05"
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {/* 내용 영역 - 상하 패딩으로 이미지 테두리 안쪽에 맞춤 */}
        <div className="flex flex-col flex-1 py-12">
          {/* Title */}
          <h1 className="mb-8 text-center">Your Playlists</h1>

          {/* Playlist Cards */}
          <div className="mb-8 flex-1 overflow-y-auto">
            {playlists.map((playlist, index) => (
              <div key={playlist.name}>
                <button
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-black/5 transition-colors"
                  onClick={() => handleSelect(playlist)}
                >
                  <span className="text-black">{playlist.name}</span>
                  {playlist.duration && (
                    <span className="text-black/40 text-sm">{playlist.duration}</span>
                  )}
                </button>
                {index < playlists.length - 1 && (
                  <div className="h-[1px] bg-black/10 mx-6" />
                )}
              </div>
            ))}
          </div>

          {/* Last Played */}
          <p className="text-sm text-black/40 text-center">
            Last played: {lastPlayed ?? "None yet"}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}