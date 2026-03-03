import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";

interface PlaylistData {
  name: string;
  duration: string | null; // e.g. "25/5"
}

type SetupState = {
  playlist?: PlaylistData;

  // when coming back from NowPlaying
  focusCount?: number;
  includeLongBreak?: boolean;

  // minutes (numbers from session state)
  workMinutes?: number;
  breakMinutes?: number;
  longBreakMinutes?: number;

  // optional flag
  isCustomMix?: boolean;
};

function digitsOnly(raw: string) {
  return raw.replace(/[^\d]/g, "");
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parsePresetDuration(duration: string | null) {
  // "25/5" -> { work: 25, break: 5 }
  if (!duration) return null;
  const [w, b] = duration.split("/").map((x) => Number(x));
  if (!Number.isFinite(w) || !Number.isFinite(b) || w <= 0 || b <= 0) return null;
  return { work: w, break: b };
}

export function MixSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as SetupState | null;
  const playlist = state?.playlist;

  const isCustomMix = playlist?.name === "Custom Mix";
  const focusOptions = [2, 3, 4, 5];

  // preset minutes (if not custom)
  const preset = useMemo(() => parsePresetDuration(playlist?.duration ?? null), [playlist?.duration]);

  // ---- initial values (prefer state -> preset -> default) ----
  const initialFocusCount = state?.focusCount ?? 4;
  const initialIncludeLongBreak = state?.includeLongBreak ?? true;

  const initialWork = state?.workMinutes ?? preset?.work ?? 25;
  const initialBreak = state?.breakMinutes ?? preset?.break ?? 5;

  // long break: prefer state, else default 15
  const initialLongBreak = state?.longBreakMinutes ?? 15;

  // ---- state ----
  const [focusCount, setFocusCount] = useState<number>(initialFocusCount);
  const [includeLongBreak, setIncludeLongBreak] = useState<boolean>(initialIncludeLongBreak);

  // minutes as STRING to allow clean input UX (no 0/negative/decimal/letters)
  const [workMinutes, setWorkMinutes] = useState<string>(String(initialWork));
  const [breakMinutes, setBreakMinutes] = useState<string>(String(initialBreak));
  const [longBreakMinutes, setLongBreakMinutes] = useState<string>(String(initialLongBreak));

  useEffect(() => {
    const breakMin = clampInt(Number(breakMinutes || "1"), 1, 60);
    const currentLong = Number(longBreakMinutes || breakMin);

    if (currentLong < breakMin) {
      setLongBreakMinutes(String(breakMin));
    }
  }, [breakMinutes]);
  
  // blur validation helpers
  const normalizeWork = () => {
    const v = workMinutes === "" ? 1 : Number(workMinutes);
    setWorkMinutes(String(clampInt(v, 1, 120)));
  };
  const normalizeBreak = () => {
    const v = breakMinutes === "" ? 1 : Number(breakMinutes);
    setBreakMinutes(String(clampInt(v, 1, 60)));
  };
  const normalizeLongBreak = () => {
    // breakMinutes가 비어있으면 1로 처리 (그리고 clamp로 안전하게)
    const minLong = clampInt(Number(breakMinutes || "1"), 1, 60);

    // longBreakMinutes가 비어있으면 최소값으로
    const v = longBreakMinutes === "" ? minLong : Number(longBreakMinutes);

    // 최소=minLong, 최대=60
    setLongBreakMinutes(String(clampInt(v, minLong, 60)));
  };

  return (
    <div className="h-full flex items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-sm">

        {/* 테두리 사진 - 원본 크기 그대로 */}
        <img
          src="/pomodoro_imgs/page_outline.webp"
          alt="card border"
          className="w-full h-auto scale-x-[1.1] scale-y-[1.2] origin-top"
        />

        {/* 내용 - 사진 안에 딱 맞게 */}
        <div 
        className="absolute inset-0 flex flex-col px-6 py-8"
        style={{ height: "120%" }}
        >

          <svg id="hand-drawn-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="hand-drawn-filter">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          <div className="flex items-center mb-8">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center -ml-10 pointer-events-none">Setup</h1>
          </div>

          <div className="hand-drawn-border bg-white px-6 py-4 mb-8 flex items-center justify-between">
            <span className="text-black">{playlist?.name || "Unknown"}</span>
            {playlist?.duration && <span className="text-black/40 text-sm">{playlist.duration}</span>}
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {isCustomMix && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-black/60">Work minutes</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={workMinutes}
                    onChange={(e) => setWorkMinutes(digitsOnly(e.target.value))} onBlur={normalizeWork}
                    className="hand-drawn-border bg-white w-full px-4 py-3 outline-none focus:bg-black/5 transition-colors" placeholder="25" />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-black/60">Break minutes</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={breakMinutes}
                    onChange={(e) => setBreakMinutes(digitsOnly(e.target.value))} onBlur={normalizeBreak}
                    className="hand-drawn-border bg-white w-full px-4 py-3 outline-none focus:bg-black/5 transition-colors" placeholder="5" />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-3 text-sm text-black/60">Focus count</label>
              <div className="grid grid-cols-4 gap-2">
                {focusOptions.map((count) => (
                  <button key={count} onClick={() => setFocusCount(count)}
                    className={`hand-drawn-border py-3 transition-colors ${focusCount === count ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}>
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-black/60">Include Long Break</label>
              <button onClick={() => setIncludeLongBreak(!includeLongBreak)}
                className={`hand-drawn-border w-14 h-8 relative transition-colors ${includeLongBreak ? "bg-black" : "bg-white"}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white transition-all ${includeLongBreak ? "right-1" : "left-1"}`} />
              </button>
            </div>

            {includeLongBreak && (
              <div>
                <label className="block mb-2 text-sm text-black/60">Long break minutes</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(digitsOnly(e.target.value))} onBlur={normalizeLongBreak}
                  className="hand-drawn-border bg-white w-full px-4 py-3 outline-none focus:bg-black/5 transition-colors" placeholder="15" />
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (playlist?.name) localStorage.setItem("lastPlayedPlaylist", playlist.name);
              const finalWork = clampInt(Number(workMinutes || "1"), 1, 120);
              const finalBreak = clampInt(Number(breakMinutes || "1"), 1, 60);
              const breakMin = clampInt(Number(breakMinutes || "1"), 1, 60);
              const finalLong = clampInt(Number(longBreakMinutes || breakMin), breakMin, 60);
              navigate("/session", { state: { playlist, focusCount, includeLongBreak, workMinutes: finalWork, breakMinutes: finalBreak, longBreakMinutes: finalLong, isCustomMix } });
            }}
            className="hand-drawn-border bg-black text-white px-8 py-4 hover:bg-black/90 transition-colors mt-8"
          >
            Start Session
          </button>

        </div>
      </div>
    </div>
  );
}