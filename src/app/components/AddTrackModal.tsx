import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export type AddTrackType = "Focus" | "Break" | "Long Break";
export type InsertWhere = "Next" | "End of Cycle";

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;

  // 최소/최대 제한
  minFocus: number;        // 보통 1
  minBreak: number;        // 보통 1
  minLongBreak: number;    // ✅ break 길이로 맞추기(너 규칙)
  maxMinutes?: number;     // 기본 120

  onAdd: (payload: { type: AddTrackType; minutes: number; insertWhere: InsertWhere }) => void;
}

function digitsOnly(raw: string) {
  return raw.replace(/[^\d]/g, "");
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function AddTrackModal({
  isOpen,
  onClose,
  minFocus,
  minBreak,
  minLongBreak,
  maxMinutes = 120,
  onAdd,
}: AddTrackModalProps) {
  const [type, setType] = useState<AddTrackType>("Break");
  const [minutes, setMinutes] = useState<string>("5");
  const [insertWhere, setInsertWhere] = useState<InsertWhere>("Next");

  const minByType = useMemo(() => {
    if (type === "Focus") return minFocus;
    if (type === "Break") return minBreak;
    return minLongBreak;
  }, [type, minFocus, minBreak, minLongBreak]);

  // 모달 열릴 때 기본값을 "최소값"으로 맞춰두기 (특히 long break가 break 최소 따라가게)
  useEffect(() => {
    if (!isOpen) return;
    setMinutes(String(minByType));
    setInsertWhere("Next");
    setType("Break");
  }, [isOpen, minByType]);

  if (!isOpen) return null;

  const normalizeMinutes = () => {
    const v = minutes === "" ? minByType : Number(minutes);
    setMinutes(String(clampInt(v, minByType, maxMinutes)));
  };

  const handleAdd = () => {
    const v = clampInt(Number(minutes || String(minByType)), minByType, maxMinutes);
    onAdd({ type, minutes: v, insertWhere });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-white/80 backdrop-blur-md"
    >
      <div
        className="relative w-full max-w-[300px]"
      >
        <img
          src="/pomodoro_imgs/page_outline.webp"
          alt="modal border"
          className="w-full h-auto scale-x-[1.1] scale-y-[1.2] origin-top translate-y-[5%]"
        />

        <div
          className="absolute inset-x-0 top-0 flex flex-col px-6 py-15"
          style={{ height: "120%", zoom: 0.75 }} 
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">Add Track</h2>
            <button onClick={onClose} className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type */}
          <div className="mb-6">
            <div className="text-xs text-black/40 tracking-wider mb-3">TYPE</div>
            <div className="grid grid-cols-3 gap-2">
              {(["Focus", "Break", "Long Break"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setType(opt)}
                  className={`hand-drawn-border px-3 py-3 text-sm transition-colors ${
                    type === opt ? "bg-black text-white" : "bg-white hover:bg-black/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="mb-6">
            <div className="text-xs text-black/40 tracking-wider mb-3">MINUTES</div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minutes}
              onChange={(e) => setMinutes(digitsOnly(e.target.value))}
              onBlur={normalizeMinutes}
              className="hand-drawn-border bg-white w-full px-4 py-3 outline-none focus:bg-black/5 transition-colors"
              placeholder={String(minByType)}
            />
            <div className="mt-2 text-xs text-black/40">
              Min: {minByType} • Max: {maxMinutes}
            </div>
          </div>

          {/* Insert where */}
          <div className="mb-8">
            <div className="text-xs text-black/40 tracking-wider mb-3">INSERT</div>
            <div className="grid grid-cols-2 gap-2">
              {(["Next", "End of Cycle"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setInsertWhere(opt)}
                  className={`hand-drawn-border px-3 py-3 text-sm transition-colors ${
                    insertWhere === opt ? "bg-black text-white" : "bg-white hover:bg-black/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="hand-drawn-border bg-black text-white w-full px-8 py-4 hover:bg-black/90 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}