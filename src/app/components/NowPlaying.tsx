import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ChevronLeft,
  Menu,
  Plus,
  Repeat,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Check,
} from "lucide-react";
import { SettingsModal, Settings, defaultSettings, playBell, playSoftTone, vibrate } from "./SettingsModal";
import { AddTrackModal, AddTrackType, InsertWhere } from "./AddTrackModal";

interface Track {
  id: number;
  title: string;
  type: "Focus" | "Break" | "Long Break";
  duration: number; // seconds
  completed: boolean;
}

interface PlaylistData {
  name: string;
  duration: string | null; // e.g. "25/5"
}

type SessionState = {
  playlist: PlaylistData;
  focusCount: number; // n
  includeLongBreak: boolean;
  workMinutes?: number; // custom
  breakMinutes?: number; // custom
  longBreakMinutes?: number; // custom or preset long break
  isCustomMix?: boolean;
};

function parsePresetDuration(duration: string | null) {
  if (!duration) return null;
  const [w, b] = duration.split("/").map((x) => Number(x));
  if (!Number.isFinite(w) || !Number.isFinite(b) || w <= 0 || b <= 0) return null;
  return { work: w, break: b };
}

function buildTracks(opts: {
  focusCount: number;
  workMinutes: number;
  breakMinutes: number;
  includeLongBreak: boolean;
  longBreakMinutes: number;
}): Track[] {
  const { focusCount, workMinutes, breakMinutes, includeLongBreak, longBreakMinutes } = opts;

  const tracks: Track[] = [];
  for (let i = 1; i <= focusCount; i++) {
    tracks.push({
      id: tracks.length + 1,
      title: `Track ${String(tracks.length + 1).padStart(2, "0")}`,
      type: "Focus",
      duration: workMinutes * 60,
      completed: false,
    });

    const isLastBreak = i === focusCount;
    tracks.push({
      id: tracks.length + 1,
      title: `Track ${String(tracks.length + 1).padStart(2, "0")}`,
      type: includeLongBreak && isLastBreak ? "Long Break" : "Break",
      duration: (includeLongBreak && isLastBreak ? longBreakMinutes : breakMinutes) * 60,
      completed: false,
    });
  }
  return tracks;
}

export function NowPlaying() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = (location.state ?? null) as SessionState | null;

  useEffect(() => {
    if (!session?.playlist) navigate(-1);
  }, [session, navigate]);

  const tracksInitial = useMemo(() => {
    const focusCount = session?.focusCount ?? 4;
    const includeLongBreak = session?.includeLongBreak ?? true;

    const preset = parsePresetDuration(session?.playlist?.duration ?? null);
    const workMinutes = session?.workMinutes ?? preset?.work ?? 25;
    const breakMinutes = session?.breakMinutes ?? preset?.break ?? 5;

    const longBreakMinutes =
      session?.longBreakMinutes ??
      (session?.breakMinutes ?? preset?.break ?? 5);

    return buildTracks({
      focusCount,
      workMinutes,
      breakMinutes,
      includeLongBreak,
      longBreakMinutes,
    });
  }, [session]);

  const baseCycleRef = useRef<Track[]>([]);
  const appendingRef = useRef(false);
  const cycleLenRef = useRef<number>(tracksInitial.length);

  useEffect(() => {
    baseCycleRef.current = tracksInitial.map((t) => ({ ...t, completed: false }));
    cycleLenRef.current = tracksInitial.length;
  }, [tracksInitial]);

  const [tracks, setTracks] = useState<Track[]>(tracksInitial);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentIndexRef = useRef(0);
  useEffect(() => {
    currentIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(tracksInitial[0]?.duration ?? 0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);

  // ✅ Settings 상태
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    setTracks(tracksInitial);
    setCurrentTrackIndex(0);
    setTimeRemaining(tracksInitial[0]?.duration ?? 0);
    setIsPlaying(true);
  }, [tracksInitial]);

  const currentTrack = tracks[currentTrackIndex];

  // ✅ 트랙 종료 시 소리 + 진동
  const playTrackEndSound = () => {
    if (settings.sound === "Bell") playBell();
    else if (settings.sound === "Soft Tone") playSoftTone();
    if (settings.vibration) vibrate();
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const nextIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(nextIndex);
      setTimeRemaining(tracks[nextIndex].duration);
    }
  };

  const handleNext = () => {
    // 현재 트랙 completed 처리
    setTracks((prev) => {
      const updated = [...prev];
      if (updated[currentTrackIndex]) {
        updated[currentTrackIndex] = { ...updated[currentTrackIndex], completed: true };
      }
      return updated;
    });

    playTrackEndSound(); // 🔊 소리 + 진동

    // 다음 트랙으로 이동
    if (currentTrackIndex < tracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      setTimeRemaining(tracks[nextIndex].duration);
      // ✅ autoStartNext가 꺼져 있으면 일시정지
      if (!settings.autoStartNext) {
        setIsPlaying(false);
      }
      return;
    }

    // 마지막 트랙
    if (!isLooping) {
      setIsPlaying(false);
      return;
    }

    // 루프: 끝에서 중복 append 방지
    if (appendingRef.current) return;
    appendingRef.current = true;

    const base = baseCycleRef.current.length ? baseCycleRef.current : tracksInitial;
    const nextIndex = currentTrackIndex + 1;

    setTracks((prev) => {
      const baseLen = prev.length;
      const appended = base.map((t, i) => ({
        ...t,
        completed: false,
        id: baseLen + i + 1,
        title: `Track ${String(baseLen + i + 1).padStart(2, "0")}`,
      }));
      return [...prev, ...appended];
    });

    setCurrentTrackIndex(nextIndex);
    setTimeRemaining(base[0]?.duration ?? 0);
    // ✅ 루프 시에도 autoStartNext 반영
    setIsPlaying(settings.autoStartNext);

    setTimeout(() => {
      appendingRef.current = false;
    }, 0);
  };

  // 타이머: 감소만 담당
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // 0이 되면 next 처리
  useEffect(() => {
    if (!isPlaying) return;
    if (timeRemaining === 0) handleNext();
  }, [timeRemaining, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeShort = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!currentTrack) return 0;
    const elapsed = currentTrack.duration - timeRemaining;
    return (elapsed / currentTrack.duration) * 100;
  };

  const progressPercent = Math.max(0, Math.min(100, getProgress()));
  const handlePlayPause = () => setIsPlaying((p) => !p);

  const renumber = (list: Track[]) =>
    list.map((t, i) => ({
      ...t,
      id: i + 1,
      title: `Track ${String(i + 1).padStart(2, "0")}`,
    }));

  const insertIntoBaseCycle = (payload: {
    type: AddTrackType;
    minutes: number;
    insertWhere: InsertWhere;
  }) => {
    const cycleLen = cycleLenRef.current || baseCycleRef.current.length || tracksInitial.length;
    const curIdx = currentIndexRef.current;
    const curCycleStart = Math.floor(curIdx / cycleLen) * cycleLen;

    const base = (baseCycleRef.current.length ? baseCycleRef.current : tracksInitial).map((t) => ({
      ...t,
      completed: false,
    }));

    const posInCycle =
      payload.insertWhere === "Next"
        ? Math.min(curIdx - curCycleStart + 1, base.length)
        : base.length;

    const newTrack: Track = {
      id: 0,
      title: "",
      type: payload.type as Track["type"],
      duration: payload.minutes * 60,
      completed: false,
    };

    const nextBase = [...base.slice(0, posInCycle), newTrack, ...base.slice(posInCycle)];
    baseCycleRef.current = renumber(nextBase);
    cycleLenRef.current = baseCycleRef.current.length;
  };

  const handleAddTrack = (payload: {
    type: AddTrackType;
    minutes: number;
    insertWhere: InsertWhere;
  }) => {
    setTracks((prev) => {
      const cycleLen = cycleLenRef.current || tracksInitial.length || prev.length;
      const curIdx = currentIndexRef.current;
      const curCycleStart = Math.floor(curIdx / cycleLen) * cycleLen;

      const insertIndex =
        payload.insertWhere === "Next"
          ? Math.min(curIdx + 1, prev.length)
          : Math.min(curCycleStart + cycleLen, prev.length);

      const newTrack: Track = {
        id: 0,
        title: "",
        type: payload.type as Track["type"],
        duration: payload.minutes * 60,
        completed: false,
      };

      const updated = [...prev.slice(0, insertIndex), newTrack, ...prev.slice(insertIndex)];
      return renumber(updated);
    });

    insertIntoBaseCycle(payload);
  };

  const preset = parsePresetDuration(session?.playlist?.duration ?? null);
  const baseBreak = session?.breakMinutes ?? preset?.break ?? 5;
  const baseLongBreak =
    session?.longBreakMinutes ??
    session?.breakMinutes ??
    preset?.break ??
    5;

  return (
    <>
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-sm">

          {/* 테두리 사진 - 고정 크기 그대로 */}
          <img
            src="/pomodoro_imgs/page_outline.webp"
            alt="card border"
            className="w-full h-auto scale-x-[1.1] scale-y-[1.2] origin-top"
          />

          {/* 내용 전체 컨테이너 */}
          <div
            className="absolute inset-x-0 top-0 flex flex-col"
            style={{ height: "110%", zoom: 0.85 }}
          >
            {/* Top Bar - 고정 (스크롤 밖) */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 flex-shrink-0">
              <button onClick={() => navigate("/setup", { state: { ...session, fromSession: true, currentTrackIndex }, replace: true })}
                className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-xs text-black/40 tracking-wider center">NOW PLAYING</div>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {/* Now Playing */}
              <div className="flex flex-col items-center mb-8">
                {currentTrack && (
                  <h2 className="text-2xl mb-12">{currentTrack.title} — {currentTrack.type}</h2>
                )}

                <div
                  className="font-light mb-12 tabular-nums tracking-tight"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "4rem" }}
                >
                  {formatTime(timeRemaining)}
                </div>

                {currentTrack && (
                  <div className="w-full mb-12">
                    <div className="flex items-center justify-between text-xs text-black/40 mb-2 tabular-nums">
                      <span>0:00</span>
                      <span>{formatTimeShort(currentTrack.duration)}</span>
                    </div>
                    <div className="relative">
                      <img src="/pomodoro_imgs/line.webp" alt="progress bar" className="w-full h-2 object-fill" />
                      <img
                        src="/pomodoro_imgs/dot.webp"
                        alt="progress dot"
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 object-contain"
                        style={{ left: `calc(${progressPercent}% - 8px)` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-8">
                  <button onClick={() => setIsAddTrackOpen(true)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  {/* 이전 */}
                  <button onClick={handlePrevious} disabled={currentTrackIndex === 0}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30 object-contain flex-shrink-0">
                    <img src="/pomodoro_imgs/previous.webp" alt="skip back" className="w-5 h-5" />
                  </button>

                  {/* Play / Pause */}
                  <button onClick={handlePlayPause} className="text-white p-4 transition-colors object-contain flex-shrink-0">
                    {isPlaying
                      ? <img src="/pomodoro_imgs/pause.webp" alt="pause" className="w-5 h-5" />
                      : <img src="/pomodoro_imgs/play.webp" alt="play" className="w-5 h-5" />
                    }
                  </button>

                  {/* 다음 */}
                  <button onClick={handleNext} disabled={currentTrackIndex === tracks.length - 1 && !isLooping}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30 object-contain flex-shrink-0">
                    <img src="/pomodoro_imgs/next.webp" alt="skip forward" className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsLooping((v) => !v)}
                    className={`p-2 hover:bg-black/5 rounded-full transition-colors ${isLooping ?  "opacity-100" : "opacity-40"}`}>
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Up Next */}
              <div className="border-t border-black/10 pt-6 pb-8">
                <h3 className="text-xs text-black/40 tracking-wider mb-4">UP NEXT</h3>
                <div className="space-y-3">
                  {tracks.map((track, index) => (
                    <div key={track.id}
                      className={`flex items-center justify-between py-2 ${index === currentTrackIndex ? "opacity-100" : "opacity-60"}`}>
                      <div className="flex items-center gap-3">
                        {track.completed ? (
                          <Check className="w-4 h-4 text-black" />
                        ) : (
                          index === currentTrackIndex ? (
                            <img src="/pomodoro_imgs/headset.webp" alt="now playing" className="w-4 h-4 object-contain scale-[1.5]" />
                          ) : (
                            <div className="w-2 h-2 bg-black rounded-full scale-[0.5]" />
                          )
                        )}
                        <span className="text-sm">{track.title} — {track.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialSettings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
        />
        <AddTrackModal
          isOpen={isAddTrackOpen}
          onClose={() => setIsAddTrackOpen(false)}
          maxMinutes={Math.max(1, session?.workMinutes ?? preset?.work ?? 25)}
          onAdd={(payload) => { handleAddTrack(payload); setIsAddTrackOpen(false); }}
        />
      </>  
  );
}
