import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { Actor } from './entities/actor.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const createQueryBuilderMock = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockActorsRepository = {
  createQueryBuilder: jest.fn(() => createQueryBuilderMock),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ActorsService', () => {
  let service: ActorsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockActorsRepository.createQueryBuilder.mockReturnValue(createQueryBuilderMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: getRepositoryToken(Actor),
          useValue: mockActorsRepository,
        },
      ],
    }).compile();

    service = module.get<ActorsService>(ActorsService);
  });

  describe('findAll', () => {
    it('returns paginated actors without a search term', async () => {
      const actors = [
        { id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] },
        { id: 2, firstName: 'Cate', lastName: 'Blanchett', movies: [] },
      ];
      createQueryBuilderMock.getManyAndCount.mockResolvedValue([actors, 2]);

      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(mockActorsRepository.createQueryBuilder).toHaveBeenCalledWith('actor');
      expect(createQueryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('actor.movies', 'movie');
      expect(createQueryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(createQueryBuilderMock.take).toHaveBeenCalledWith(10);
      expect(createQueryBuilderMock.orderBy).toHaveBeenCalledWith('actor.createdAt', 'DESC');
      expect(createQueryBuilderMock.where).not.toHaveBeenCalled();
      expect(result).toEqual({ data: actors, total: 2, page: 1, limit: 10 });
    });

    it('applies ILIKE search on CONCAT of firstName and lastName when search is provided', async () => {
      const actors = [{ id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] }];
      createQueryBuilderMock.getManyAndCount.mockResolvedValue([actors, 1]);

      const query: PaginationQueryDto = { page: 1, limit: 10, search: 'tom han' };
      const result = await service.findAll(query);

      expect(createQueryBuilderMock.where).toHaveBeenCalledWith(
        "CONCAT(actor.firstName, ' ', actor.lastName) ILIKE :search",
        { search: '%tom han%' },
      );
      expect(result.total).toBe(1);
    });

    it('calculates skip offset correctly for page 3', async () => {
      createQueryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, limit: 5 });

      expect(createQueryBuilderMock.skip).toHaveBeenCalledWith(10);
      expect(createQueryBuilderMock.take).toHaveBeenCalledWith(5);
    });

    it('uses default page and limit when not provided', async () => {
      createQueryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('returns empty data array when no actors exist', async () => {
      createQueryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('returns an actor when found by id', async () => {
      const actor = { id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] };
      mockActorsRepository.findOne.mockResolvedValue(actor);

      const result = await service.findOne(1);

      expect(mockActorsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['movies'],
      });
      expect(result).toEqual(actor);
    });

    it('throws NotFoundException when actor does not exist', async () => {
      mockActorsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Actor with ID 999 not found'),
      );
    });

    it('throws NotFoundException with the correct id in the message', async () => {
      mockActorsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow('Actor with ID 42 not found');
    });
  });

  describe('getMovies', () => {
    it('returns movies for a given actor', async () => {
      const movies = [
        { id: 1, title: 'Cast Away' },
        { id: 2, title: 'Forrest Gump' },
      ];
      const actor = { id: 1, firstName: 'Tom', lastName: 'Hanks', movies };
      mockActorsRepository.findOne.mockResolvedValue(actor);

      const result = await service.getMovies(1);

      expect(mockActorsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['movies'],
      });
      expect(result).toEqual(movies);
    });

    it('throws NotFoundException when actor does not exist', async () => {
      mockActorsRepository.findOne.mockResolvedValue(null);

      await expect(service.getMovies(999)).rejects.toThrow(
        new NotFoundException('Actor with ID 999 not found'),
      );
    });

    it('returns empty array when actor has no movies', async () => {
      const actor = { id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] };
      mockActorsRepository.findOne.mockResolvedValue(actor);

      const result = await service.getMovies(1);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('creates and saves a new actor', async () => {
      const dto: CreateActorDto = { firstName: 'Tom', lastName: 'Hanks', birthDate: '1956-07-09' };
      const created = { id: 1, ...dto, movies: [] };

      mockActorsRepository.create.mockReturnValue(created);
      mockActorsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockActorsRepository.create).toHaveBeenCalledWith(dto);
      expect(mockActorsRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('creates an actor without an optional birthDate', async () => {
      const dto: CreateActorDto = { firstName: 'Cate', lastName: 'Blanchett' };
      const created = { id: 2, ...dto, movies: [] };

      mockActorsRepository.create.mockReturnValue(created);
      mockActorsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockActorsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('updates actor fields and saves', async () => {
      const existingActor = { id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] };
      const dto: UpdateActorDto = { firstName: 'Thomas' };
      const saved = { ...existingActor, firstName: 'Thomas' };

      mockActorsRepository.findOne.mockResolvedValue(existingActor);
      mockActorsRepository.save.mockResolvedValue(saved);

      const result = await service.update(1, dto);

      expect(mockActorsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Thomas', lastName: 'Hanks' }),
      );
      expect(result).toEqual(saved);
    });

    it('throws NotFoundException when actor does not exist', async () => {
      mockActorsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { firstName: 'X' })).rejects.toThrow(
        new NotFoundException('Actor with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('removes an actor and returns deleted confirmation', async () => {
      const actor = { id: 1, firstName: 'Tom', lastName: 'Hanks', movies: [] };
      mockActorsRepository.findOne.mockResolvedValue(actor);
      mockActorsRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockActorsRepository.remove).toHaveBeenCalledWith(actor);
      expect(result).toEqual({ deleted: true });
    });

    it('throws NotFoundException when actor does not exist', async () => {
      mockActorsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Actor with ID 999 not found'),
      );
    });
  });
});
