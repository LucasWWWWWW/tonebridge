"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export interface ByokConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const BYOK_STORAGE_KEY = "tonebridge:byok";

const EMPTY: ByokConfig = { baseUrl: "", apiKey: "", model: "" };

/** 从 localStorage 读取 BYOK 配置（SSR 安全）。 */
export function loadByok(): ByokConfig {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(BYOK_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ByokConfig>;
    return {
      baseUrl: parsed.baseUrl?.trim() ?? "",
      apiKey: parsed.apiKey?.trim() ?? "",
      model: parsed.model?.trim() ?? "",
    };
  } catch {
    return EMPTY;
  }
}

// ── localStorage 外部存储：useSyncExternalStore 读取，跨标签页 + 保存时同步 ──
let snapshot: ByokConfig = EMPTY;
let snapshotLoaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === BYOK_STORAGE_KEY) {
      snapshot = loadByok();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ByokConfig {
  if (!snapshotLoaded) {
    snapshot = loadByok();
    snapshotLoaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): ByokConfig {
  return EMPTY;
}

/** 读取当前 BYOK 配置（SSR 安全；保存或跨标签页变更时自动刷新）。 */
export function useByok(): ByokConfig {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 写入 BYOK 配置：空值则清除；同步内存快照并通知订阅者。 */
export function saveByok(next: ByokConfig): void {
  const value: ByokConfig = {
    baseUrl: next.baseUrl.trim(),
    apiKey: next.apiKey.trim(),
    model: next.model.trim(),
  };
  try {
    if (value.apiKey || value.baseUrl || value.model) {
      window.localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  } catch {
    /* 隐私模式等场景静默 */
  }
  snapshot = value;
  snapshotLoaded = true;
  emit();
}

interface ByokSettingsProps {
  open: boolean;
  onClose: () => void;
  config: ByokConfig;
  onSave: (config: ByokConfig) => void;
}

export default function ByokSettings({
  open,
  onClose,
  config,
  onSave,
}: ByokSettingsProps) {
  const [draft, setDraft] = useState<ByokConfig>(config);

  // 打开时把外部 config 同步进 draft：渲染期对比上一次 open，避免在 effect 里 setState
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(config);
  }

  // Esc 关闭 + 打开时锁定背景滚动
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (patch: Partial<ByokConfig>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const handleSave = () => {
    onSave({
      baseUrl: draft.baseUrl.trim(),
      apiKey: draft.apiKey.trim(),
      model: draft.model.trim(),
    });
    onClose();
  };

  const handleClear = () => {
    setDraft(EMPTY);
    onSave(EMPTY);
  };

  const inputCls =
    "tb-focus w-full rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 transition-colors focus:border-clay/50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="byok-title"
    >
      {/* 背景遮罩 */}
      <button
        type="button"
        aria-label="关闭设置"
        onClick={onClose}
        className="tb-fade absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
      />

      {/* 抽屉 / 弹窗 */}
      <div className="tb-pop relative z-10 w-full max-w-md rounded-t-2xl border border-line-strong bg-paper-raised p-6 shadow-[var(--shadow-raised)] sm:rounded-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong sm:hidden" />

        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <h2
              id="byok-title"
              className="font-serif text-xl font-bold tracking-tight text-ink"
            >
              自带模型 Key
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              填写后请求将走你自己的兼容 OpenAI 接口，且不受频率限制。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="tb-focus -mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-paper-sunken hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
              API Key
              <span className="ml-1 text-clay">必填</span>
            </span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft.apiKey}
              onChange={(e) => set({ apiKey: e.target.value })}
              placeholder="sk-..."
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
              Base URL
              <span className="ml-1 font-normal normal-case tracking-normal text-ink-faint/70">
                选填
              </span>
            </span>
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={draft.baseUrl}
              onChange={(e) => set({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
              Model
              <span className="ml-1 font-normal normal-case tracking-normal text-ink-faint/70">
                选填
              </span>
            </span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={draft.model}
              onChange={(e) => set({ model: e.target.value })}
              placeholder="gpt-4o-mini"
              className={inputCls}
            />
          </label>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          仅保存在本地浏览器（localStorage），不会上传到我们的服务器。
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="tb-focus rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-danger"
          >
            清除
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="tb-focus ml-auto rounded-xl bg-clay px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_var(--clay)] transition-all hover:bg-clay-deep active:scale-[0.98]"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
