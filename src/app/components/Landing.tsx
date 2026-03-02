import { useNavigate } from "react-router";

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center px-6">
      {/* Hidden SVG filter for hand-drawn effect */}
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
      
      <div className="w-full max-w-sm">
        <div className="hand-drawn-border bg-white px-8 py-12 flex flex-col items-center text-center">
          {/* Title */}
          <h1 className="mb-3">
            Pomodoro Playlist
          </h1>
          
          {/* Subtitle */}
          <p className="mb-12 text-black/60">
            Turn focus into tracks.
          </p>
          
          {/* Primary Button */}
          <button 
            className="hand-drawn-border bg-black text-white px-8 py-3 mb-8 hover:bg-black/90 transition-colors"
            onClick={() => navigate("/playlists")}
          >
            Start Listening
          </button>
          
          {/* Footnote */}
          <p className="text-sm text-black/40">
            No login · saved on this device
          </p>
        </div>
      </div>
    </div>
  );
}