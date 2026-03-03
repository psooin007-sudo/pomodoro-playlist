import { useState } from "react";
import { X } from "lucide-react";
import { useEffect } from "react";

// 🔊 Web Audio API로 소리 생성
export function playBell() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.5);
}

export function playSoftTone() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
}

// 📳 바이브레이션 — 안드로이드만 지원
export function vibrate() {
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
}

export type SoundOption = "Bell" | "Soft Tone" | "Mute";

export interface Settings {
  autoStartNext: boolean;
  sound: SoundOption;
  vibration: boolean;
}

export const defaultSettings: Settings = {
  autoStartNext: true,
  sound: "Bell",
  vibration: true,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: Settings;
  onSave: (settings: Settings) => void;
}

// 안드로이드 여부 체크
const supportsVibration =
  "vibrate" in navigator && /Android/i.test(navigator.userAgent);

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`hand-drawn-border w-14 h-8 relative transition-colors ${
        value ? "bg-black" : "bg-white"
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 transition-all ${
          value ? "right-1 bg-white" : "left-1 bg-black"
        }`}
      />
    </button>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: SettingsModalProps) {
  const init = initialSettings ?? defaultSettings;
  const [autoStartNext, setAutoStartNext] = useState(init.autoStartNext);
  const [sound, setSound] = useState<SoundOption>(init.sound);
  const [vibration, setVibration] = useState(init.vibration);

  useEffect(() => {
    if (isOpen) {
      const init = initialSettings ?? defaultSettings;
      setAutoStartNext(init.autoStartNext);
      setSound(init.sound);
      setVibration(init.vibration);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreview = (option: SoundOption) => {
    setSound(option);
    if (option === "Bell") playBell();
    else if (option === "Soft Tone") playSoftTone();
  };

  const handleSave = () => {
    onSave({ autoStartNext, sound, vibration });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-white/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-[300px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 테두리 사진 */}
        <img
          src="/pomodoro_imgs/page_outline.webp"
          alt="modal border"
          className="w-full h-auto scale-x-[1.1] scale-y-[1.2] origin-top translate-y-[5%]"
        />

        {/* 내용 */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col px-6 py-15"
          style={{ height: "120%", zoom: 0.75 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">Settings</h2>
            <button onClick={onClose} className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto">
            {/* Auto Start Next Track */}
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-black/80">Auto Start Next Track</label>
              <Toggle value={autoStartNext} onChange={setAutoStartNext} />
            </div>

            {/* Vibration */}
            {supportsVibration && (
              <div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm text-black/80">Vibration</label>
                  <Toggle value={vibration} onChange={setVibration} />
                </div>
                <p className="text-xs text-black/30 mt-1" style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
                  무음 모드에서는 진동이 작동하지 않을 수 있어요
                </p>
              </div>
            )}

            <div className="border-t border-black/10" />

            {/* Sound Options */}
            <div>
              <h3 className="text-xs text-black/40 tracking-wider mb-3">SOUND</h3>
              <div className="space-y-2">
                {(["Bell", "Soft Tone", "Mute"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => handlePreview(option)}
                    className={`hand-drawn-border w-full px-4 py-3 text-left transition-colors ${
                      sound === option ? "bg-black text-white" : "bg-white hover:bg-black/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p className="text-xs text-black/30 mt-2" style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
                탭하면 미리 들을 수 있어요 / 무음모드면 소리가 안 날 수 있어요
              </p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="hand-drawn-border bg-black text-white w-full px-8 py-4 hover:bg-black/90 transition-colors mt-6"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}