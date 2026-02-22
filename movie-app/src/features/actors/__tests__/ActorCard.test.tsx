import { render, screen } from '@/test-utils';
import ActorCard from '../components/ActorCard';
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

const baseActor: Actor = {
  id: 5,
  firstName: 'Meryl',
  lastName: 'Streep',
  birthDate: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ActorCard', () => {
  it('renders the actor full name', () => {
    render(<ActorCard actor={baseActor} />);

    expect(screen.getByText('Meryl Streep')).toBeInTheDocument();
  });

  it('renders initials in the avatar element', () => {
    render(<ActorCard actor={baseActor} />);

    // ActorCard renders first letter of firstName + first letter of lastName
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('links to the correct actor detail page', () => {
    render(<ActorCard actor={baseActor} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/actors/5');
  });

  it('renders "View filmography" text', () => {
    render(<ActorCard actor={baseActor} />);

    expect(screen.getByText('View filmography')).toBeInTheDocument();
  });

  it('renders birth date when provided', () => {
    const actor: Actor = { ...baseActor, birthDate: '1949-06-22' };

    render(<ActorCard actor={actor} />);

    // formatDate formats to locale string containing the year
    expect(screen.getByText(/born/i)).toBeInTheDocument();
    expect(screen.getByText(/1949/i)).toBeInTheDocument();
  });

  it('does not render birth date section when birthDate is null', () => {
    render(<ActorCard actor={{ ...baseActor, birthDate: null }} />);

    expect(screen.queryByText(/born/i)).not.toBeInTheDocument();
  });
});
