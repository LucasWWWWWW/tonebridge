"use client";

import { useId } from "react";
import {
  EMOTIONS,
  FORMALITIES,
  GENDERS,
  TARGET_LANGS,
  type Formality,
  type Gender,
} from "@/lib/schema";
import { FORMALITY_LABELS, GENDER_LABELS, langLabel } from "@/lib/labels";

export interface FormState {
  text: string;
  targetLang: string;
  emotion: string;
  formality: Formality;
  relationship: string;
  speakerGender: Gender | "";
  counterpartGender: Gender | "";
}

interface TranslateFormProps {
  value: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onSubmit: () => void;
  loading: boolean;
}

const MAX_LEN = 2000;

export default function TranslateForm({
  value,
  onChange,
  onSubmit,
  loading,
}: TranslateFormProps) {
  const uid = useId();
  const presetLangSelected = (TARGET_LANGS as readonly string[]).includes(
    value.targetLang,
  );
  const customLang = presetLangSelected ? "" : value.targetLang;

  // targetLang 至少 2 字符，与服务端 schema min(2) 对齐，避免自定义单字符触发 400
  const canSubmit =
    value.text.trim().length > 0 && value.targetLang.trim().length >= 2 && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 要翻译的话 ── */}
      <div>
        <div className="relative">
          <textarea
            id={`${uid}-text`}
            value={value.text}
            onChange={(e) => onChange({ text: e.target.value.slice(0, MAX_LEN) })}
            onKeyDown={(e) => {
              // ⌘/Ctrl + Enter 提交
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
                e.preventDefault();
                onSubmit();
              }
            }}
            rows={4}
            placeholder="例：我想和你一起去看花火大会，然后去祭拜神社"
            aria-label="要翻译的中文"
            className="tb-focus w-full resize-none rounded-2xl border border-line-strong bg-paper-raised px-4 py-3.5 font-serif text-lg leading-relaxed text-ink placeholder:font-sans placeholder:text-base placeholder:text-ink-faint/70 shadow-[var(--shadow-soft)] transition-colors focus:border-clay/50"
          />
          <span
            className={`pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] tabular-nums ${
              value.text.length > MAX_LEN - 100
                ? "text-clay"
                : "text-ink-faint/70"
            }`}
          >
            {value.text.length}/{MAX_LEN}
          </span>
        </div>
      </div>

      {/* ── 目标语言 ── */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          译成
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          {TARGET_LANGS.map((code) => {
            const active = value.targetLang === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ targetLang: code })}
                className={[
                  "tb-focus rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                  active
                    ? "border-clay/40 bg-clay text-white shadow-[0_6px_16px_-8px_var(--clay)]"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:border-clay/40 hover:text-ink",
                ].join(" ")}
              >
                {langLabel(code)}
              </button>
            );
          })}

          {/* 自定义语言 */}
          <div
            className={[
              "flex items-center rounded-full border px-3 py-1 transition-colors",
              customLang
                ? "border-clay/40 bg-clay-wash"
                : "border-dashed border-line-strong bg-paper-raised",
            ].join(" ")}
          >
            <span className="mr-1 text-xs text-ink-faint" aria-hidden>
              其他
            </span>
            <input
              type="text"
              value={customLang}
              onChange={(e) => onChange({ targetLang: e.target.value })}
              placeholder="如 ko / 法语"
              aria-label="自定义目标语言"
              className="tb-focus w-24 rounded-full bg-transparent px-1 py-1 text-sm text-ink placeholder:text-ink-faint/60 focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* ── 情绪 ── */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          情绪
        </legend>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emo) => {
            const active = value.emotion === emo;
            return (
              <button
                key={emo}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ emotion: active ? "" : emo })}
                className={[
                  "tb-focus rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 active:scale-[0.97]",
                  active
                    ? "border-teal/50 bg-teal text-white shadow-[0_6px_16px_-8px_var(--teal)]"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:border-teal/40 hover:text-ink",
                ].join(" ")}
              >
                {emo}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── 正式度 + 关系（并排，移动端堆叠） ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            正式度
          </legend>
          <div className="inline-flex w-full rounded-full border border-line-strong bg-paper-sunken p-1">
            {FORMALITIES.map((f) => {
              const active = value.formality === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ formality: f })}
                  className={[
                    "tb-focus flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-paper-raised text-ink shadow-[var(--shadow-soft)]"
                      : "text-ink-faint hover:text-ink-soft",
                  ].join(" ")}
                >
                  {FORMALITY_LABELS[f]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={`${uid}-rel`}
            className="mb-2.5 block text-xs font-medium uppercase tracking-[0.18em] text-ink-faint"
          >
            关系
            <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-faint/70">
              选填
            </span>
          </label>
          <input
            id={`${uid}-rel`}
            type="text"
            value={value.relationship}
            onChange={(e) => onChange({ relationship: e.target.value.slice(0, 40) })}
            placeholder="如 恋人 / 客户 / 朋友"
            className="tb-focus w-full rounded-full border border-line-strong bg-paper-raised px-4 py-2 text-sm text-ink placeholder:text-ink-faint/70 transition-colors focus:border-clay/50"
          />
        </div>
      </div>

      {/* ── 性别（我 / 对方，均选填，影响第一人称与称呼） ── */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          性别
          <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-faint/70">
            选填
          </span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["speakerGender", "我", value.speakerGender] as const,
            ["counterpartGender", "对方", value.counterpartGender] as const,
          ]).map(([field, label, current]) => (
            <div key={field} className="flex items-center gap-2.5">
              <span className="shrink-0 text-sm text-ink-soft">{label}</span>
              <div className="inline-flex flex-1 rounded-full border border-line-strong bg-paper-sunken p-1">
                {GENDERS.map((g) => {
                  const active = current === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ [field]: active ? "" : g })}
                      className={[
                        "tb-focus flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-paper-raised text-ink shadow-[var(--shadow-soft)]"
                          : "text-ink-faint hover:text-ink-soft",
                      ].join(" ")}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* ── 主按钮 ── */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          "tb-focus group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-200",
          canSubmit
            ? "bg-clay text-white shadow-[0_14px_30px_-12px_var(--clay)] hover:bg-clay-deep active:scale-[0.99]"
            : "cursor-not-allowed bg-paper-sunken text-ink-faint",
        ].join(" ")}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeOpacity="0.3"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            正在搭桥…
          </>
        ) : (
          <>
            翻译
            <svg
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
      <p className="-mt-3 text-center text-xs text-ink-faint/80">
        按 ⌘/Ctrl + Enter 快速翻译
      </p>
    </form>
  );
}
