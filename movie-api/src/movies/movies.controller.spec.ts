import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const mockMoviesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getActors: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: typeof mockMoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('delegates to MoviesService.findAll with the query object', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('delegates search query to the service', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 5, search: 'inception' };
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 5 });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('delegates to MoviesService.findOne with the parsed id', async () => {
      const movie = { id: 1, title: 'Inception', actors: [], ratings: [] };
      service.findOne.mockResolvedValue(movie);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(movie);
    });

    it('passes the numeric id (not string) to the service', async () => {
      service.findOne.mockResolvedValue({ id: 42, title: 'Movie' });

      await controller.findOne(42);

      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('getActors', () => {
    it('delegates to MoviesService.getActors with the movie id', async () => {
      const actors = [{ id: 1, firstName: 'Tom', lastName: 'Hanks' }];
      service.getActors.mockResolvedValue(actors);

      const result = await controller.getActors(1);

      expect(service.getActors).toHaveBeenCalledWith(1);
      expect(result).toEqual(actors);
    });
  });

  describe('create', () => {
    it('delegates to MoviesService.create with the dto', async () => {
      const dto: CreateMovieDto = { title: 'New Movie', genre: 'Drama' };
      const created = { id: 1, ...dto };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('passes actorIds in the dto to the service', async () => {
      const dto: CreateMovieDto = { title: 'New Movie', actorIds: [1, 2] };
      service.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('delegates to MoviesService.update with the id and dto', async () => {
      const dto: UpdateMovieDto = { title: 'Updated Title' };
      const updated = { id: 1, title: 'Updated Title' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to MoviesService.remove with the id', async () => {
      service.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
