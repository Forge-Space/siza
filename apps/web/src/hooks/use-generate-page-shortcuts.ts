'use client';

import { useEffect, useRef } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const modKey = isMac ? 'metaKey' : 'ctrlKey';

export interface UseGeneratePageShortcutsOptions {
  formRef: React.RefObject<HTMLFormElement | null>;
  onSaveTemplate: () => void;
  saveDialogOpen: boolean;
  onCloseModals: () => void;
  promptInputId?: string;
}

export function useGeneratePageShortcuts({
  formRef,
  onSaveTemplate,
  saveDialogOpen,
  onCloseModals,
  promptInputId = 'prompt',
}: UseGeneratePageShortcutsOptions) {
  const onCloseRef = useRef(onCloseModals);
  useEffect(() => {
    onCloseRef.current = onCloseModals;
  }, [onCloseModals]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (saveDialogOpen) {
          e.preventDefault();
          onCloseRef.current?.();
        }
        return;
      }

      const mod = e[modKey as keyof KeyboardEvent];
      if (!mod) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
        return;
      }

      if (e.key === 's') {
        e.preventDefault();
        onSaveTemplate();
        return;
      }

      if (e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(promptInputId) as HTMLElement | null;
        const focusable = el?.querySelector?.('textarea, input') ?? el;
        if (focusable && typeof (focusable as HTMLElement).focus === 'function') {
          (focusable as HTMLElement).focus();
        }
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [formRef, onSaveTemplate, saveDialogOpen, promptInputId]);
}

export function useShortcutLabel(shortcut: string): string {
  return shortcut.replace('meta', '⌘').replace('ctrl', 'Ctrl').replace('Enter', '↵');
}
