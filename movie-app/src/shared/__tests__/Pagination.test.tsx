import { render, screen, fireEvent } from '@/test-utils';
import Pagination from '../components/Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination page={1} total={10} limit={10} onPageChange={jest.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when total is exactly equal to limit', () => {
    const { container } = render(
      <Pagination page={1} total={5} limit={5} onPageChange={jest.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders when there are multiple pages', () => {
    render(<Pagination page={1} total={30} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
  });

  it('shows correct page info — current page and total pages', () => {
    render(<Pagination page={2} total={50} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('disables the Previous button on the first page', () => {
    render(<Pagination page={1} total={30} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('disables the Next button on the last page', () => {
    render(<Pagination page={3} total={30} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('enables both buttons when on a middle page', () => {
    render(<Pagination page={2} total={30} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('calls onPageChange with page - 1 when Previous is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={3} total={50} limit={10} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with page + 1 when Next is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} total={50} limit={10} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('computes total pages correctly using Math.ceil', () => {
    // total=25, limit=10 => 3 pages
    render(<Pagination page={1} total={25} limit={10} onPageChange={jest.fn()} />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
