"use client";

import { useCallback, useState } from "react";
import {
  BYOK_HEADERS,
  type TranslateRequest,
  type TranslateResult,
} from "@/lib/schema";
import type { Scene } from "@/lib/presets/scenes";
import PresetPicker from "@/components/PresetPicker";
import TranslateForm, { type FormState } from "@/components/TranslateForm";
import ResultCard from "@/components/ResultCard";
import ByokSettings, {
  useByok,
  saveByok,
} from "@/components/ByokSettings";

const INITIAL_FORM: FormState = {
  text: "",
  targetLang: "ja",
  emotion: "温柔",
  formality: "neutral",
  relationship: "",
};

interface ApiError {
  message: string;
  rateLimited: boolean;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [presetId, setPresetId] = useState<string | null>(null);

  const [result, setResult] = useState<TranslateResult | null>(null);
  const [resultLang, setResultLang] = useState<string>("ja");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const byok = useByok();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasKey = byok.apiKey.trim().length > 0;

  const patchForm = useCallback((patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
  }, []);

  // 选择场景 → 写入默认 relationship/formality/emotion；取消 → 仅清 presetId
  const handlePreset = useCallback((scene: Scene | null) => {
    if (!scene) {
      setPresetId(null);
      return;
    }
    setPresetId(scene.id);
    setForm((f) => ({
      ...f,
      relationship: scene.relationship,
      formality: scene.formality,
      emotion: scene.emotion,
    }));
  }, []);

  const translate = useCallback(async () => {
    setLoading(true);
    setError(null);

    const body: TranslateRequest = {
      text: form.text.trim(),
      targetLang: form.targetLang.trim(),
      emotion: form.emotion.trim() || "平淡",
      formality: form.formality,
      ...(form.relationship.trim()
        ? { relationship: form.relationship.trim() }
        : {}),
      ...(presetId ? { presetId } : {}),
    };

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (byok.apiKey.trim()) {
      headers[BYOK_HEADERS.apiKey] = byok.apiKey.trim();
      if (byok.baseUrl.trim()) headers[BYOK_HEADERS.baseUrl] = byok.baseUrl.trim();
      if (byok.model.trim()) headers[BYOK_HEADERS.model] = byok.model.trim();
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = "翻译失败，请稍后再试。";
        try {
          const data = (await res.json()) as { error?: string; details?: string };
          if (data?.error) msg = data.error;
        } catch {
          /* 非 JSON 响应 */
        }
        setError({ message: msg, rateLimited: res.status === 429 });
        setResult(null);
        return;
      }

      const data = (await res.json()) as TranslateResult;
      setResult(data);
      setResultLang(body.targetLang);
    } catch {
      setError({
        message: "网络异常，无法连接到服务。请检查网络后重试。",
        rateLimited: false,
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [form, presetId, byok]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:max-w-6xl lg:px-8">
      {/* ── 顶栏 ── */}
      <header className="mb-7 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-semibold italic tracking-tight text-ink sm:text-4xl">
            <span aria-hidden className="text-clay">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                <path
                  d="M3 21 Q16 3 29 21"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <line x1="9" y1="14.5" x2="9" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="11" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="14.5" x2="23" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="22" x2="29" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            Tonebridge
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            把心里话翻成地道外语，并回译让你确认对方读到的语气。
          </p>
          {hasKey && (
            <span className="tb-fade mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-wash px-2.5 py-1 text-xs font-medium text-teal-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
              使用自带 key
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="设置自带 Key"
          className="tb-focus grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong bg-paper-raised text-ink-soft shadow-[var(--shadow-soft)] transition-all hover:rotate-45 hover:text-clay"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.07a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.07a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H11a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.07a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V11a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.07a1.7 1.7 0 0 0-1.55 1Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </button>
      </header>

      {/* ── 主体：小屏单列堆叠；lg 起左右两栏（输入 | 结果） ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        {/* ── 输入卡（左栏） ── */}
        <div className="rounded-[1.75rem] border border-line-strong bg-paper/40 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-5 lg:sticky lg:top-8">
          <PresetPicker value={presetId} onChange={handlePreset} />
          <div className="my-5 h-px bg-line" />
          <TranslateForm
            value={form}
            onChange={patchForm}
            onSubmit={translate}
            loading={loading}
          />
        </div>

        {/* ── 结果区（右栏） ── */}
        <div>
          {error && (
          <div
            role="alert"
            className="tb-rise rounded-2xl border border-danger/30 bg-danger-wash p-4"
          >
            <div className="flex gap-3">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger/15 text-danger"
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8v5M12 16.5v.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <div className="text-sm">
                <p className="font-medium text-ink">{error.message}</p>
                {error.rateLimited && (
                  <p className="mt-1 text-ink-soft">
                    可在右上角{" "}
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(true)}
                      className="font-medium text-clay underline-offset-2 hover:underline"
                    >
                      设置
                    </button>{" "}
                    里填写自带 key 解除限制。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && !result && <LoadingSkeleton />}

        {result && !loading && (
          <ResultCard result={result} targetLang={resultLang} />
        )}

          {!result && !loading && !error && <EmptyState />}
        </div>
      </div>

      <ByokSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={byok}
        onSave={saveByok}
      />
    </div>
  );
}

/* ── 空态：克制的引导 ── */
function EmptyState() {
  return (
    <div className="tb-fade flex flex-col items-center px-6 py-10 text-center">
      <svg
        width="64"
        height="40"
        viewBox="0 0 64 40"
        fill="none"
        className="mb-4 text-line-strong"
        aria-hidden
      >
        <path
          d="M4 32 Q32 0 60 32"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 6"
        />
        <line x1="18" y1="20" x2="18" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="13" x2="32" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="20" x2="46" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="font-serif text-base text-ink-soft">
        写下你想说的话，搭一座语气的桥。
      </p>
      <p className="mt-1 text-sm text-ink-faint">
        译文 · 回译确认 · 语气说明 · 两条备选
      </p>
    </div>
  );
}

/* ── 加载骨架 ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="正在翻译">
      <div className="rounded-2xl border border-line-strong bg-paper-raised p-6">
        <div className="tb-skeleton mb-4 h-3 w-16 rounded-full" />
        <div className="tb-skeleton mb-2.5 h-6 w-full rounded-lg" />
        <div className="tb-skeleton h-6 w-4/5 rounded-lg" />
      </div>
      <div className="rounded-2xl border-2 border-teal/25 bg-teal-wash p-6">
        <div className="tb-skeleton mb-4 h-3 w-24 rounded-full" />
        <div className="tb-skeleton mb-2.5 h-5 w-full rounded-lg" />
        <div className="tb-skeleton h-5 w-3/4 rounded-lg" />
      </div>
    </div>
  );
}
