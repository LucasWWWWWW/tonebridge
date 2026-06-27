"use client";

import { useState } from "react";
import type { TranslateResult } from "@/lib/schema";
import { LANG_NATIVE, langLabel } from "@/lib/labels";

interface ResultCardProps {
  result: TranslateResult;
  targetLang: string;
}

/** 复制文本：优先用安全上下文的 clipboard API，http 局域网（如手机扫码访问）下回退到 execCommand。 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 落到下方回退 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** 复制按钮：成功后短暂显示“已复制”。 */
function CopyButton({
  text,
  label = "复制",
  tone = "ink",
}: {
  text: string;
  label?: string;
  tone?: "ink" | "teal" | "clay";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const toneCls =
    tone === "teal"
      ? "text-teal hover:bg-teal-wash"
      : tone === "clay"
        ? "text-clay hover:bg-clay-wash"
        : "text-ink-soft hover:bg-paper-sunken hover:text-ink";

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`tb-focus inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${toneCls}`}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="9"
            y="9"
            width="11"
            height="11"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
      {copied ? "已复制" : label}
    </button>
  );
}

export default function ResultCard({ result, targetLang }: ResultCardProps) {
  const native = LANG_NATIVE[targetLang] ?? langLabel(targetLang);

  return (
    <section
      aria-label="翻译结果"
      className="tb-rise space-y-4"
      style={{ animationDelay: "40ms" }}
    >
      {/* ── 译文（主角） ── */}
      <article className="relative overflow-hidden rounded-2xl border border-line-strong bg-paper-raised p-5 shadow-[var(--shadow-raised)] sm:p-6">
        {/* 角落装饰：陶土色直角，呼应信纸 */}
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-clay/10 blur-2xl"
          aria-hidden
        />
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-sm font-bold text-clay">译文</span>
            <span className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              {native}
            </span>
          </div>
          <CopyButton text={result.translation} label="复制译文" tone="clay" />
        </header>
        <p
          lang={targetLang}
          className="font-serif text-2xl font-medium leading-relaxed tracking-tight text-ink sm:text-[1.75rem]"
        >
          {result.translation}
        </p>
      </article>

      {/* ── 回译校验（核心卖点 · 视觉突出） ── */}
      <article className="relative overflow-hidden rounded-2xl border-2 border-teal/35 bg-teal-wash p-5 shadow-[var(--shadow-soft)] sm:p-6">
        {/* 桥梁微动效 */}
        <svg
          className="pointer-events-none absolute right-4 top-4 opacity-40"
          width="56"
          height="22"
          viewBox="0 0 56 22"
          fill="none"
          aria-hidden
        >
          <path
            d="M2 18 Q28 -4 54 18"
            stroke="var(--teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="3 5"
            style={{ animation: "tb-bridge 3s ease-in-out infinite" }}
          />
          <line x1="14" y1="11" x2="14" y2="18" stroke="var(--teal)" strokeWidth="1.4" />
          <line x1="28" y1="6" x2="28" y2="18" stroke="var(--teal)" strokeWidth="1.4" />
          <line x1="42" y1="11" x2="42" y2="18" stroke="var(--teal)" strokeWidth="1.4" />
        </svg>

        <header className="mb-2 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-serif text-sm font-bold text-teal-deep">
            回译
          </span>
          <span className="text-xs text-teal-deep/75">
            · 把译文翻回中文供你确认
          </span>
        </header>
        <p className="font-serif text-lg font-medium leading-relaxed text-ink sm:text-xl">
          {result.backTranslation}
        </p>
      </article>

      {/* ── 语气 ── */}
      <article className="rounded-2xl border border-line-strong bg-paper-raised p-4 shadow-[var(--shadow-soft)] sm:px-5">
        <div className="flex gap-3">
          <span
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay-wash text-base"
            aria-hidden
          >
            🎐
          </span>
          <div>
            <span className="mb-0.5 block text-xs font-medium uppercase tracking-wider text-gold">
              语气
            </span>
            <p className="text-sm leading-relaxed text-ink-soft">
              {result.toneNote}
            </p>
          </div>
        </div>
      </article>

      {/* ── 备选说法 ── */}
      <article className="rounded-2xl border border-line-strong bg-paper-raised p-5 shadow-[var(--shadow-soft)]">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
          备选说法
        </h3>
        <ul className="space-y-2.5">
          {result.alternatives.map((alt, i) => (
            <li
              key={i}
              className="group flex items-start justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-3 transition-colors hover:border-line-strong"
            >
              <div className="flex gap-2.5">
                <span
                  className="mt-0.5 font-serif text-sm font-bold text-clay/70"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <p
                  lang={targetLang}
                  className="font-serif text-base leading-relaxed text-ink"
                >
                  {alt}
                </p>
              </div>
              <CopyButton text={alt} label="复制" />
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
