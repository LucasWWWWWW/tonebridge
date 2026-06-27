"use client";

import { SCENES, type Scene } from "@/lib/presets/scenes";

interface PresetPickerProps {
  /** 当前选中的场景 id（未选为 null） */
  value: string | null;
  /** 选中/取消场景。传入完整 Scene 便于上层一次性写入 relationship/formality/emotion；取消时为 null。 */
  onChange: (scene: Scene | null) => void;
}

export default function PresetPicker({ value, onChange }: PresetPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        <span>场景</span>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <span className="font-normal normal-case tracking-normal text-ink-faint/80">
          一键定调
        </span>
      </legend>

      <div className="flex flex-wrap gap-2">
        {SCENES.map((scene) => {
          const active = scene.id === value;
          return (
            <button
              key={scene.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : scene)}
              className={[
                "tb-focus group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                active
                  ? "border-clay/40 bg-clay text-white shadow-[0_6px_16px_-8px_var(--clay)]"
                  : "border-line-strong bg-paper-raised text-ink-soft hover:border-clay/40 hover:text-ink",
              ].join(" ")}
            >
              <span
                className="text-base leading-none transition-transform duration-200 group-hover:-translate-y-px group-hover:rotate-[-6deg]"
                aria-hidden
              >
                {scene.emoji}
              </span>
              <span>{scene.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
