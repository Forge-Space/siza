import { render, screen } from '@testing-library/react';
import CatalogCard from '@/components/catalog/CatalogCard';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockEntry = {
  id: 'entry-1',
  name: 'my-service',
  display_name: 'My Service',
  type: 'service' as const,
  lifecycle: 'production' as const,
  owner_id: 'user-1',
  team: 'Platform',
  repository_url: 'https://github.com/org/repo',
  documentation_url: null,
  tags: ['typescript', 'api', 'backend', 'extra-tag'],
  dependencies: ['core', 'shared'],
  project_id: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('CatalogCard', () => {
  it('renders display name', () => {
    render(<CatalogCard entry={mockEntry} />);
    expect(screen.getByText('My Service')).toBeInTheDocument();
  });

  it('renders lifecycle badge', () => {
    render(<CatalogCard entry={mockEntry} />);
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('renders team name', () => {
    render(<CatalogCard entry={mockEntry} />);
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('shows max 3 tags with overflow count', () => {
    render(<CatalogCard entry={mockEntry} />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('links to catalog entry detail page', () => {
    render(<CatalogCard entry={mockEntry} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/catalog/entry-1');
  });

  it('renders dependency count', () => {
    render(<CatalogCard entry={mockEntry} />);
    expect(screen.getByText('2 dependencies')).toBeInTheDocument();
  });

  it('renders without team when not provided', () => {
    const entryWithoutTeam = { ...mockEntry, team: undefined };
    render(<CatalogCard entry={entryWithoutTeam} />);
    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
    expect(screen.getByText('My Service')).toBeInTheDocument();
  });

  it('renders without tags when empty', () => {
    const entryWithoutTags = { ...mockEntry, tags: [] };
    render(<CatalogCard entry={entryWithoutTags} />);
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });
});
