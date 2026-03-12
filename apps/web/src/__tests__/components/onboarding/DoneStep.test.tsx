import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DoneStep } from '@/components/onboarding/DoneStep';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: jest.fn(),
}));

describe('DoneStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it('routes to project-aware generate flow when project exists', async () => {
    const user = userEvent.setup();
    render(<DoneStep project={{ id: 'p-1', name: 'Project One' }} />);

    await user.click(screen.getByRole('button', { name: 'Continue to Generate' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/onboarding/complete', { method: 'POST' });
      expect(mockPush).toHaveBeenCalledWith('/generate?projectId=p-1&source=onboarding&step=done');
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'done',
          params: expect.objectContaining({
            cta: 'continue_to_generate',
          }),
        })
      );
    });
  });

  it('routes to project creation when no project exists', async () => {
    const user = userEvent.setup();
    render(<DoneStep project={null} />);

    await user.click(screen.getByRole('button', { name: 'Create Project' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/new?source=onboarding&step=done');
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'done',
          params: expect.objectContaining({
            cta: 'create_project',
          }),
        })
      );
    });
  });
});
