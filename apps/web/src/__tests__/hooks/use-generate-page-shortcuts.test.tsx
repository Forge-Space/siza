import { render } from '@testing-library/react';
import React, { useRef } from 'react';
import { useGeneratePageShortcuts, useShortcutLabel } from '@/hooks/use-generate-page-shortcuts';

function fireShortcut(key: string, options?: { meta?: boolean; ctrl?: boolean }) {
  const meta = options?.meta ?? true;
  const ctrl = options?.ctrl ?? true;
  const event = new KeyboardEvent('keydown', {
    key,
    metaKey: meta,
    ctrlKey: ctrl,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
}

function TestWrapper({
  saveDialogOpen,
  onSaveTemplate,
  onCloseModals,
  promptInputId = 'prompt',
}: {
  saveDialogOpen: boolean;
  onSaveTemplate: () => void;
  onCloseModals: () => void;
  promptInputId?: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  useGeneratePageShortcuts({
    formRef,
    onSaveTemplate,
    saveDialogOpen,
    onCloseModals,
    promptInputId,
  });
  return (
    <div>
      <form ref={formRef} data-testid="form">
        <div id={promptInputId}>
          <textarea data-testid="prompt-input" aria-label="Prompt" />
        </div>
      </form>
    </div>
  );
}

describe('useGeneratePageShortcuts', () => {
  let onSaveTemplate: jest.Mock;
  let onCloseModals: jest.Mock;

  beforeEach(() => {
    onSaveTemplate = jest.fn();
    onCloseModals = jest.fn();
  });

  it('calls form requestSubmit on Meta+Enter', () => {
    const { getByTestId } = render(
      <TestWrapper
        saveDialogOpen={false}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    const form = getByTestId('form') as HTMLFormElement;
    form.requestSubmit = jest.fn();

    fireShortcut('Enter');
    expect(form.requestSubmit).toHaveBeenCalled();
  });

  it('calls onSaveTemplate on Meta+S', () => {
    render(
      <TestWrapper
        saveDialogOpen={false}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    fireShortcut('s');
    expect(onSaveTemplate).toHaveBeenCalled();
  });

  it('focuses prompt element on Meta+K', () => {
    const { getByTestId } = render(
      <TestWrapper
        saveDialogOpen={false}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    const textarea = getByTestId('prompt-input');
    const focusSpy = jest.spyOn(textarea, 'focus');

    fireShortcut('k');
    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('calls onCloseModals on Escape when saveDialogOpen is true', () => {
    render(
      <TestWrapper
        saveDialogOpen={true}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    fireShortcut('Escape', { meta: false, ctrl: false });
    expect(onCloseModals).toHaveBeenCalled();
  });

  it('does not call onCloseModals on Escape when saveDialogOpen is false', () => {
    render(
      <TestWrapper
        saveDialogOpen={false}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    expect(onCloseModals).not.toHaveBeenCalled();
  });

  it('ignores Enter without meta/ctrl', () => {
    const { getByTestId } = render(
      <TestWrapper
        saveDialogOpen={false}
        onSaveTemplate={onSaveTemplate}
        onCloseModals={onCloseModals}
      />
    );
    const form = getByTestId('form') as HTMLFormElement;
    form.requestSubmit = jest.fn();

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: false,
      ctrlKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });
});

describe('useShortcutLabel', () => {
  it('replaces meta with ⌘ and Enter with ↵', () => {
    expect(useShortcutLabel('meta+Enter')).toBe('⌘+↵');
  });

  it('replaces ctrl with Ctrl', () => {
    expect(useShortcutLabel('ctrl+s')).toContain('Ctrl');
  });
});
