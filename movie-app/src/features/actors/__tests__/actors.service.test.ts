import { getActors, getActor, getActorMovies } from '../api/actors.service';
import api from '@/shared/api/axios';

jest.mock('@/shared/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = api.get as jest.MockedFunction<typeof api.get>;

describe('actors.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActors', () => {
    it('calls GET /actors with no params when none are provided', async () => {
      const payload = { data: [], total: 0, page: 1, limit: 10 };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getActors({});

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/actors', { params: {} });
      expect(result).toEqual(payload);
    });

    it('calls GET /actors with page, limit and search params', async () => {
      const payload = { data: [], total: 0, page: 3, limit: 20 };
      mockGet.mockResolvedValueOnce({ data: payload });

      await getActors({ page: 3, limit: 20, search: 'streep' });

      expect(mockGet).toHaveBeenCalledWith('/actors', {
        params: { page: 3, limit: 20, search: 'streep' },
      });
    });

    it('returns the data from the API response', async () => {
      const payload = {
        data: [{ id: 1, firstName: 'Meryl', lastName: 'Streep' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getActors({ page: 1, limit: 10 });

      expect(result).toEqual(payload);
    });
  });

  describe('getActor', () => {
    it('calls GET /actors/:id with the given id', async () => {
      const payload = { id: 7, firstName: 'Tom', lastName: 'Hanks', movies: [] };
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getActor(7);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/actors/7');
      expect(result).toEqual(payload);
    });
  });

  describe('getActorMovies', () => {
    it('calls GET /actors/:id/movies with the given id', async () => {
      const payload = [{ id: 1, title: 'Cast Away' }];
      mockGet.mockResolvedValueOnce({ data: payload });

      const result = await getActorMovies(7);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/actors/7/movies');
      expect(result).toEqual(payload);
    });
  });
});
