import { render, screen } from '@/test-utils';
import MovieCard from '../components/MovieCard';
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

const baseMovie: Movie = {
  id: 1,
  title: 'Inception',
  description: 'A mind-bending thriller.',
  releaseDate: '2010-07-16',
  genre: 'Sci-Fi',
  actors: [],
  ratings: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('MovieCard', () => {
  it('renders the movie title', () => {
    render(<MovieCard movie={baseMovie} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('renders the release year derived from releaseDate', () => {
    render(<MovieCard movie={baseMovie} />);

    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('renders the genre badge', () => {
    render(<MovieCard movie={baseMovie} />);

    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
  });

  it('renders the movie description', () => {
    render(<MovieCard movie={baseMovie} />);

    expect(screen.getByText('A mind-bending thriller.')).toBeInTheDocument();
  });

  it('renders fallback text when description is null', () => {
    render(<MovieCard movie={{ ...baseMovie, description: null }} />);

    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('renders a rating badge when ratings are provided', () => {
    const movie: Movie = {
      ...baseMovie,
      ratings: [
        { id: 1, value: 8, comment: null, movieId: 1, createdAt: '', updatedAt: '' },
      ],
    };

    render(<MovieCard movie={movie} />);

    // RatingBadge displays average as "x/10"
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('renders "No ratings" when ratings array is empty', () => {
    render(<MovieCard movie={{ ...baseMovie, ratings: [] }} />);

    expect(screen.getByText('No ratings')).toBeInTheDocument();
  });

  it('renders actor names when actors are present', () => {
    const movie: Movie = {
      ...baseMovie,
      actors: [
        {
          id: 10,
          firstName: 'Leonardo',
          lastName: 'DiCaprio',
          birthDate: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
    };

    render(<MovieCard movie={movie} />);

    expect(screen.getByText('Leonardo DiCaprio')).toBeInTheDocument();
  });

  it('links to the correct movie detail page', () => {
    render(<MovieCard movie={baseMovie} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/movies/1');
  });

  it('does not render actor section when actors array is empty', () => {
    render(<MovieCard movie={{ ...baseMovie, actors: [] }} />);

    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it('renders N/A for year when releaseDate is null', () => {
    render(<MovieCard movie={{ ...baseMovie, releaseDate: null }} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
