import { render, screen, fireEvent } from '@testing-library/react';
import ApiDocsPanel from '@/components/catalog/api-docs/ApiDocsPanel';

const VALID_SPEC = JSON.stringify({
  openapi: '3.0.3',
  info: { title: 'Test API', version: '2.0.0' },
  servers: [{ url: 'https://api.example.com' }],
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        tags: ['users'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Page number',
          },
        ],
        responses: {
          '200': {
            description: 'User list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create user',
        tags: ['users'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
        },
      },
    },
    '/users/{id}': {
      delete: {
        summary: 'Delete user',
        deprecated: true,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Deleted' },
        },
      },
    },
  },
});

describe('ApiDocsPanel', () => {
  it('renders API title and version', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    expect(screen.getByText('Test API')).toBeInTheDocument();
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('renders server URL', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    expect(
      screen.getByText('https://api.example.com')
    ).toBeInTheDocument();
  });

  it('renders endpoint count', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    expect(screen.getByText('3 endpoints')).toBeInTheDocument();
  });

  it('renders method badges', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    const getBadges = screen.getAllByText('get');
    expect(getBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('post')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('renders endpoint paths', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    const usersPaths = screen.getAllByText('/users');
    expect(usersPaths.length).toBe(2);
    expect(screen.getByText('/users/{id}')).toBeInTheDocument();
  });

  it('filters endpoints by search', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    const input = screen.getByPlaceholderText('Search endpoints...');
    fireEvent.change(input, { target: { value: 'delete' } });
    expect(screen.getByText('/users/{id}')).toBeInTheDocument();
    expect(screen.queryByText('List users')).not.toBeInTheDocument();
  });

  it('shows error state for invalid spec', () => {
    render(<ApiDocsPanel spec="not a valid spec {{" />);
    expect(screen.getByText(/Invalid OpenAPI spec/)).toBeInTheDocument();
  });

  it('renders with object spec', () => {
    const specObj = JSON.parse(VALID_SPEC);
    render(<ApiDocsPanel spec={specObj} />);
    expect(screen.getByText('Test API')).toBeInTheDocument();
  });

  it('applies deprecated styling', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    const deprecatedPath = screen.getByText('/users/{id}');
    expect(deprecatedPath).toHaveClass('line-through');
  });

  it('groups untagged endpoints under Other', () => {
    render(<ApiDocsPanel spec={VALID_SPEC} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Delete user')).toBeInTheDocument();
  });
});
