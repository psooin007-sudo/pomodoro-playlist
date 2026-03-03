import { useNavigate } from "react-router";

export function Landing() {
  const navigate = useNavigate();

  return (
      <div className="h-full flex items-center justify-center px-6 py-12">
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
        <div className="relative w-full">
          <img
            src="/pomodoro_imgs/page_outline.webp"
            alt="card border"
            className="w-full h-auto scale-x- scale-y-[1.2] origin-top"
          />

          <div className="absolute inset-0 px-8 py-12 flex flex-col items-center text-center">
            {/* Title */}
            <h1 className="mb-3">Pomodoro Playlist</h1>

            <img
              src="/pomodoro_imgs/landing.webp"
              alt="doodle"
              className="w-50 h-50 object-contain"
            />

            {/* Subtitle */}
            <p className="mb-12 text-black/60">Turn focus into tracks.</p>

            {/* Primary Button */}
            <button
              onClick={() => navigate("/playlists")}
              className="relative mb-8 w-3/4 max-w-[300px]"
            >
              <img
                src="/pomodoro_imgs/landing_btn.webp"
                alt="start button"
                className="w-full h-auto"
              />

              <span className="absolute inset-0 flex items-center justify-center text-black text-lg -translate-y-1">
                Start Listening
              </span>
            </button>

            {/* Footnote */}
            <p className="text-sm text-black/40">No login · saved on this device</p>
          </div>
        </div>
      </div>
    </div>
  );
}