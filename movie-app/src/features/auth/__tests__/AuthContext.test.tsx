import { render, screen, act } from '@/test-utils';
import { AuthProvider, useAuth, isTokenExpired } from '../context/AuthContext';

/** Build a fake JWT with a given `exp` (seconds since epoch). */
function fakeJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ sub: '1', exp }));
  return `${header}.${payload}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

// A simple consumer component that exposes context values through the DOM
// so we can assert on them without relying on internal state.
function AuthConsumer() {
  const { isAuthenticated, user, token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <button onClick={() => login('tok-abc', 'alice')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithAuthProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    renderWithAuthProvider();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
  });

  it('restores session from localStorage on mount when token is valid', () => {
    const validToken = fakeJwt(FUTURE_EXP);
    localStorage.setItem('token', validToken);
    localStorage.setItem('username', 'bob');

    renderWithAuthProvider();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('bob');
    expect(screen.getByTestId('token')).toHaveTextContent(validToken);
  });

  it('discards expired token and clears localStorage on mount', () => {
    const expiredToken = fakeJwt(PAST_EXP);
    localStorage.setItem('token', expiredToken);
    localStorage.setItem('username', 'bob');

    renderWithAuthProvider();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('updates state and localStorage when login is called', () => {
    renderWithAuthProvider();

    act(() => {
      screen.getByRole('button', { name: /login/i }).click();
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('alice');
    expect(screen.getByTestId('token')).toHaveTextContent('tok-abc');
    expect(localStorage.getItem('token')).toBe('tok-abc');
    expect(localStorage.getItem('username')).toBe('alice');
  });

  it('clears state and localStorage when logout is called', () => {
    localStorage.setItem('token', 'tok-abc');
    localStorage.setItem('username', 'alice');

    renderWithAuthProvider();

    act(() => {
      screen.getByRole('button', { name: /logout/i }).click();
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('throws when useAuth is used outside an AuthProvider', () => {
    // Suppress the expected console error that React logs for thrown errors.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );

    consoleError.mockRestore();
  });
});

describe('isTokenExpired', () => {
  it('returns false for a token expiring in the future', () => {
    expect(isTokenExpired(fakeJwt(FUTURE_EXP))).toBe(false);
  });

  it('returns true for a token that already expired', () => {
    expect(isTokenExpired(fakeJwt(PAST_EXP))).toBe(true);
  });

  it('returns true for a malformed token', () => {
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });

  it('returns true when payload has no exp claim', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ sub: '1' }));
    expect(isTokenExpired(`${header}.${payload}.sig`)).toBe(true);
  });
});
