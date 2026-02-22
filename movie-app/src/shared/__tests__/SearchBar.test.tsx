import { render, screen, fireEvent, act } from '@/test-utils';
import SearchBar from '../components/SearchBar';

jest.useFakeTimers();

describe('SearchBar', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('renders an input element', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the placeholder text', () => {
    render(<SearchBar value="" onChange={jest.fn()} placeholder="Search movies..." />);

    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
  });

  it('uses the default placeholder when none is provided', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('shows the initial value in the input', () => {
    render(<SearchBar value="inception" onChange={jest.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('inception');
  });

  it('does not call onChange immediately after typing', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inter' } });

    // onChange should not fire before debounce delay elapses
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with the typed value after the debounce delay', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inter' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('inter');
  });

  it('only fires onChange once when multiple characters are typed quickly', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'i' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'in' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inc' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('inc');
  });

  it('does not call onChange when the typed value equals the current value prop', () => {
    // When value and debouncedValue are equal, the SearchBar guards against calling onChange.
    const onChange = jest.fn();
    render(<SearchBar value="inception" onChange={onChange} />);

    // No typing — just advance time; debouncedValue === value, so onChange must not fire.
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
