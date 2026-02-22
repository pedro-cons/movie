import { Test, TestingModule } from '@nestjs/testing';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const mockActorsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getMovies: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ActorsController', () => {
  let controller: ActorsController;
  let service: typeof mockActorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActorsController],
      providers: [
        {
          provide: ActorsService,
          useValue: mockActorsService,
        },
      ],
    }).compile();

    controller = module.get<ActorsController>(ActorsController);
    service = module.get(ActorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('delegates to ActorsService.findAll with the query object', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('passes search query through to the service', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10, search: 'tom' };
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('delegates to ActorsService.findOne with the numeric id', async () => {
      const actor = { id: 1, firstName: 'Tom', lastName: 'Hanks' };
      service.findOne.mockResolvedValue(actor);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(actor);
    });

    it('passes the correct id to the service', async () => {
      service.findOne.mockResolvedValue({ id: 5, firstName: 'Cate', lastName: 'Blanchett' });

      await controller.findOne(5);

      expect(service.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('getMovies', () => {
    it('delegates to ActorsService.getMovies with the actor id', async () => {
      const movies = [{ id: 1, title: 'Cast Away' }];
      service.getMovies.mockResolvedValue(movies);

      const result = await controller.getMovies(1);

      expect(service.getMovies).toHaveBeenCalledWith(1);
      expect(result).toEqual(movies);
    });
  });

  describe('create', () => {
    it('delegates to ActorsService.create with the dto', async () => {
      const dto: CreateActorDto = { firstName: 'Tom', lastName: 'Hanks', birthDate: '1956-07-09' };
      const created = { id: 1, ...dto };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('delegates to ActorsService.update with the id and dto', async () => {
      const dto: UpdateActorDto = { firstName: 'Thomas' };
      const updated = { id: 1, firstName: 'Thomas', lastName: 'Hanks' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to ActorsService.remove with the id', async () => {
      service.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
