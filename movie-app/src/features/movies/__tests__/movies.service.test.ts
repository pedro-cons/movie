import { getMovies, getMovie, getMovieActors } from '../api/movies.service';
import api from '@/shared/api/axios';

jest.mock('@/shared/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = api.get as jest.MockedFunction<typeof api.get>;

describe('movies.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    it('calls GET /movies with no params when none are provided', async () => {
      const payload = { data: [], total: 0, page: 1, limit: 10 };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getMovies({});

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/movies', { params: {} });
      expect(result).toEqual(payload);
    });

    it('calls GET /movies with page, limit and search params', async () => {
      const payload = { data: [], total: 0, page: 2, limit: 5 };
      mockGet.mockResolvedValueOnce({ data: payload });

      await getMovies({ page: 2, limit: 5, search: 'inception' });

      expect(mockGet).toHaveBeenCalledWith('/movies', {
        params: { page: 2, limit: 5, search: 'inception' },
      });
    });

    it('returns the data from the API response', async () => {
      const payload = {
        data: [{ id: 1, title: 'Inception' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getMovies({ page: 1, limit: 10 });

      expect(result).toEqual(payload);
    });
  });

  describe('getMovie', () => {
    it('calls GET /movies/:id with the given id', async () => {
      const payload = { id: 42, title: 'Interstellar' };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getMovie(42);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/movies/42');
      expect(result).toEqual(payload);
    });
  });

  describe('getMovieActors', () => {
    it('calls GET /movies/:id/actors with the given id', async () => {
      const payload = [{ id: 1, firstName: 'Leonardo', lastName: 'DiCaprio' }];
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getMovieActors(42);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/movies/42/actors');
      expect(result).toEqual(payload);
    });
  });
});
