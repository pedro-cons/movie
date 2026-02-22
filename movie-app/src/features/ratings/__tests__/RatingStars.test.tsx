import { render, screen } from '@/test-utils';
import RatingStars from '../components/RatingStars';

// RatingStars renders 5 SVG stars. Stars at index < Math.round(value / 2)
// receive the "filled" yellow class; the rest receive the grey class.

function getStars(container: HTMLElement) {
  return container.querySelectorAll('svg');
}

describe('RatingStars', () => {
  it('renders exactly 5 stars', () => {
    const { container } = render(<RatingStars value={6} />);

    expect(getStars(container)).toHaveLength(5);
  });

  it('renders the accessible aria-label with value and max', () => {
    render(<RatingStars value={7} max={10} />);

    expect(screen.getByLabelText('Rating: 7 out of 10')).toBeInTheDocument();
  });

  it('uses default max of 10 when max prop is omitted', () => {
    render(<RatingStars value={5} />);

    expect(screen.getByLabelText('Rating: 5 out of 10')).toBeInTheDocument();
  });

  it('displays the numeric value text', () => {
    render(<RatingStars value={8} />);

    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('fills 4 stars for a value of 8 (Math.round(8/2) = 4)', () => {
    const { container } = render(<RatingStars value={8} />);

    const stars = Array.from(getStars(container));
    const filled = stars.filter((s) => s.classList.contains('text-yellow-400'));
    const empty = stars.filter((s) => s.classList.contains('text-gray-300'));

    expect(filled).toHaveLength(4);
    expect(empty).toHaveLength(1);
  });

  it('fills 5 stars for a value of 10 (Math.round(10/2) = 5)', () => {
    const { container } = render(<RatingStars value={10} />);

    const stars = Array.from(getStars(container));
    const filled = stars.filter((s) => s.classList.contains('text-yellow-400'));
    const empty = stars.filter((s) => s.classList.contains('text-gray-300'));

    expect(filled).toHaveLength(5);
    expect(empty).toHaveLength(0);
  });

  it('fills 0 stars for a value of 0 (Math.round(0/2) = 0)', () => {
    const { container } = render(<RatingStars value={0} />);

    const stars = Array.from(getStars(container));
    const filled = stars.filter((s) => s.classList.contains('text-yellow-400'));
    const empty = stars.filter((s) => s.classList.contains('text-gray-300'));

    expect(filled).toHaveLength(0);
    expect(empty).toHaveLength(5);
  });

  it('fills 3 stars for a value of 6 (Math.round(6/2) = 3)', () => {
    const { container } = render(<RatingStars value={6} />);

    const stars = Array.from(getStars(container));
    const filled = stars.filter((s) => s.classList.contains('text-yellow-400'));

    expect(filled).toHaveLength(3);
  });

  it('rounds correctly — value of 5 gives 3 filled stars (Math.round(5/2) = 3)', () => {
    const { container } = render(<RatingStars value={5} />);

    const stars = Array.from(getStars(container));
    const filled = stars.filter((s) => s.classList.contains('text-yellow-400'));

    expect(filled).toHaveLength(3);
  });
});
