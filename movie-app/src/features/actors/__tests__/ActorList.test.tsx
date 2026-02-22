import { render, screen } from '@/test-utils';
import ActorList from '../components/ActorList';
import { Actor } from '../types/actor.types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

function makeActor(id: number, firstName: string, lastName: string): Actor {
  return {
    id,
    firstName,
    lastName,
    birthDate: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

describe('ActorList', () => {
  it('renders the empty state when actors array is empty', () => {
    render(<ActorList actors={[]} />);

    expect(screen.getByText('No actors found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument();
  });

  it('does not render any actor card links when list is empty', () => {
    render(<ActorList actors={[]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a card for each actor in the list', () => {
    const actors = [
      makeActor(1, 'Meryl', 'Streep'),
      makeActor(2, 'Tom', 'Hanks'),
      makeActor(3, 'Cate', 'Blanchett'),
    ];

    render(<ActorList actors={actors} />);

    expect(screen.getByText('Meryl Streep')).toBeInTheDocument();
    expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    expect(screen.getByText('Cate Blanchett')).toBeInTheDocument();
  });

  it('renders the correct number of links for the actor list', () => {
    const actors = [makeActor(1, 'Actor', 'One'), makeActor(2, 'Actor', 'Two')];

    render(<ActorList actors={actors} />);

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders a grid container when actors are present', () => {
    const actors = [makeActor(1, 'Solo', 'Actor')];

    const { container } = render(<ActorList actors={actors} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid.tagName).toBe('DIV');
    expect(grid.className).toContain('grid');
  });
});
