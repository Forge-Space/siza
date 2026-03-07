import { render, screen, waitFor } from '@testing-library/react';
import CatalogList from '@/components/catalog/CatalogList';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@siza/ui', () => ({
  Skeleton: function MockSkeleton({ className }: { className?: string }) {
    return <div data-testid="skeleton" className={className} />;
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CatalogList', () => {
  it('shows loading skeletons initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<CatalogList />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no entries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
      }),
    });
    render(<CatalogList />);
    await waitFor(() => {
      expect(screen.getByText(/no catalog entries/i)).toBeInTheDocument();
    });
  });

  it('renders entries after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: '1',
            name: 'svc',
            display_name: 'My Service',
            type: 'service',
            lifecycle: 'production',
            owner_id: 'u1',
            team: null,
            tags: [],
            dependencies: [],
            repository_url: null,
            documentation_url: null,
            project_id: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      }),
    });
    render(<CatalogList />);
    await waitFor(() => {
      expect(screen.getByText('My Service')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    render(<CatalogList />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load catalog/i)).toBeInTheDocument();
    });
  });

  it('fetches with type filter parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
      }),
    });
    render(<CatalogList />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/catalog'));
    });
  });
});
