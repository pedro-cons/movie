import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const mockRatingsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RatingsController', () => {
  let controller: RatingsController;
  let service: typeof mockRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: mockRatingsService,
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
    service = module.get(RatingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('delegates to RatingsService.findAll merging query and movieId', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query, undefined);

      expect(service.findAll).toHaveBeenCalledWith({ ...query, movieId: undefined });
      expect(result).toEqual(expected);
    });

    it('passes movieId to the service when provided', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      service.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.findAll(query, 5);

      expect(service.findAll).toHaveBeenCalledWith({ ...query, movieId: 5 });
    });
  });

  describe('findOne', () => {
    it('delegates to RatingsService.findOne with the numeric id', async () => {
      const rating = { id: 1, value: 8, comment: 'Great', movieId: 1 };
      service.findOne.mockResolvedValue(rating);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(rating);
    });

    it('passes the correct id to the service', async () => {
      service.findOne.mockResolvedValue({ id: 7, value: 5, movieId: 2 });

      await controller.findOne(7);

      expect(service.findOne).toHaveBeenCalledWith(7);
    });
  });

  describe('create', () => {
    it('delegates to RatingsService.create with the dto', async () => {
      const dto: CreateRatingDto = { value: 9, comment: 'Masterpiece', movieId: 1 };
      const created = { id: 1, ...dto };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('delegates to RatingsService.update with the id and dto', async () => {
      const dto: UpdateRatingDto = { value: 10, comment: 'Amazing' };
      const updated = { id: 1, value: 10, comment: 'Amazing', movieId: 1 };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to RatingsService.remove with the id', async () => {
      service.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
