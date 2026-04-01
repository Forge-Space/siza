import { renderHook } from '@testing-library/react';
import { useFeatureFlag, useFeatureFlags } from '@/hooks/use-feature-flag';
import * as features from '@/lib/features/flags';

jest.mock('@/lib/features/provider', () => ({
  useFeatureFlagContext: jest.fn(),
}));

jest.mock('@/lib/features/flags');

const { useFeatureFlagContext } = require('@/lib/features/provider');

describe('useFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns flag from centralized context when enabled', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: { TEST_FLAG: true },
    });
    (features.getFeatureFlag as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useFeatureFlag('TEST_FLAG'));
    expect(result.current).toBe(true);
  });

  it('returns flag from getFeatureFlag when centralized is disabled', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: {},
    });
    (features.getFeatureFlag as jest.Mock).mockImplementation((name: string) => {
      return name === 'TEST_FLAG' ? true : false;
    });

    const { result } = renderHook(() => useFeatureFlag('TEST_FLAG'));
    expect(result.current).toBe(true);
  });

  it('returns false when flag is disabled', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: { TEST_FLAG: false },
    });
    (features.getFeatureFlag as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useFeatureFlag('TEST_FLAG'));
    expect(result.current).toBe(false);
  });
});

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns multiple flags', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: { FLAG_A: true, FLAG_B: false },
    });
    (features.getFeatureFlag as jest.Mock).mockImplementation((name: string) => {
      return name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS' ? true : false;
    });

    const { result } = renderHook(() => useFeatureFlags(['FLAG_A', 'FLAG_B']));
    expect(result.current).toEqual({ FLAG_A: true, FLAG_B: false });
  });

  it('returns empty object for empty names', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: {},
    });
    (features.getFeatureFlag as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useFeatureFlags([]));
    expect(result.current).toEqual({});
  });

  it('merges centralized and feature flags correctly', () => {
    (useFeatureFlagContext as jest.Mock).mockReturnValue({
      flags: { CENTRALIZED_FLAG: true },
    });
    (features.getFeatureFlag as jest.Mock).mockImplementation((name: string) => {
      if (name === 'ENABLE_CENTRALIZED_FEATURE_FLAGS') return true;
      return name === 'ENV_FLAG' ? true : false;
    });

    const { result } = renderHook(() =>
      useFeatureFlags(['CENTRALIZED_FLAG', 'ENV_FLAG', 'UNKNOWN_FLAG'])
    );
    expect(result.current).toEqual({
      CENTRALIZED_FLAG: true,
      ENV_FLAG: true,
      UNKNOWN_FLAG: false,
    });
  });
});
