import { render, screen } from '@/test-utils';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie.types';

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

function makeMovie(id: number, title: string): Movie {
  return {
    id,
    title,
    description: null,
    releaseDate: '2020-01-01',
    genre: null,
    actors: [],
    ratings: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };
}

describe('MovieList', () => {
  it('renders the empty state when movies array is empty', () => {
    render(<MovieList movies={[]} />);

    expect(screen.getByText('No movies found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument();
  });

  it('does not render any movie cards when list is empty', () => {
    render(<MovieList movies={[]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a card for each movie in the list', () => {
    const movies = [
      makeMovie(1, 'Inception'),
      makeMovie(2, 'Interstellar'),
      makeMovie(3, 'The Dark Knight'),
    ];

    render(<MovieList movies={movies} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
  });

  it('renders the correct number of links for the movie list', () => {
    const movies = [makeMovie(1, 'Film A'), makeMovie(2, 'Film B')];

    render(<MovieList movies={movies} />);

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders a grid container when movies are present', () => {
    const movies = [makeMovie(1, 'Solo Movie')];

    const { container } = render(<MovieList movies={movies} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid.tagName).toBe('DIV');
    expect(grid.className).toContain('grid');
  });
});
