import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { RatingsService } from "./ratings.service";
import { Rating } from "./entities/rating.entity";
import { Movie } from "../movies/entities/movie.entity";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe("RatingsService", () => {
  let service: RatingsService;
  let ratingsRepository: MockRepository<Rating>;
  let moviesRepository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: getRepositoryToken(Rating),
          useValue: createMockRepository<Rating>(),
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: createMockRepository<Movie>(),
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    ratingsRepository = module.get<MockRepository<Rating>>(
      getRepositoryToken(Rating),
    );
    moviesRepository = module.get<MockRepository<Movie>>(
      getRepositoryToken(Movie),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns paginated ratings without movieId filter", async () => {
      const ratings = [
        { id: 1, value: 8, comment: "Great", movieId: 1 },
        { id: 2, value: 5, comment: "Average", movieId: 2 },
      ];
      ratingsRepository.findAndCount.mockResolvedValue([ratings, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(ratingsRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["movie"],
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({ data: ratings, total: 2, page: 1, limit: 10 });
    });

    it("filters by movieId when provided", async () => {
      const ratings = [{ id: 1, value: 8, comment: "Great", movieId: 1 }];
      ratingsRepository.findAndCount.mockResolvedValue([ratings, 1]);

      const result = await service.findAll({ page: 1, limit: 10, movieId: 1 });

      expect(ratingsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { movieId: 1 } }),
      );
      expect(result.total).toBe(1);
    });

    it("calculates skip offset correctly for page 2", async () => {
      ratingsRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 5 });

      expect(ratingsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it("uses default page and limit when not provided", async () => {
      ratingsRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("returns empty data array when no ratings exist", async () => {
      ratingsRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("findOne", () => {
    it("returns a rating when found by id", async () => {
      const rating = {
        id: 1,
        value: 8,
        comment: "Great",
        movieId: 1,
        movie: { id: 1 },
      };
      ratingsRepository.findOne.mockResolvedValue(rating);

      const result = await service.findOne(1);

      expect(ratingsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["movie"],
      });
      expect(result).toEqual(rating);
    });

    it("throws NotFoundException when rating does not exist", async () => {
      ratingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("Rating with ID 999 not found"),
      );
    });

    it("throws NotFoundException with the correct id in the message", async () => {
      ratingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Rating with ID 42 not found",
      );
    });
  });

  describe("create", () => {
    it("creates a rating after verifying the movie exists", async () => {
      const movie = { id: 1, title: "Inception" };
      const dto: CreateRatingDto = {
        value: 9,
        comment: "Masterpiece",
        movieId: 1,
      };
      const created = { id: 1, ...dto, movie };

      moviesRepository.findOne.mockResolvedValue(movie);
      ratingsRepository.create.mockReturnValue(created);
      ratingsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(moviesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(ratingsRepository.create).toHaveBeenCalledWith(dto);
      expect(ratingsRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it("throws NotFoundException when the referenced movie does not exist", async () => {
      const dto: CreateRatingDto = { value: 7, comment: "Good", movieId: 999 };
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(
        new NotFoundException("Movie with ID 999 not found"),
      );
    });

    it("does not create a rating when the movie is not found", async () => {
      const dto: CreateRatingDto = { value: 5, movieId: 999 };
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);

      expect(ratingsRepository.create).not.toHaveBeenCalled();
      expect(ratingsRepository.save).not.toHaveBeenCalled();
    });

    it("creates a rating with minimum valid value of 1", async () => {
      const movie = { id: 1, title: "Inception" };
      const dto: CreateRatingDto = { value: 1, movieId: 1 };
      const created = { id: 1, ...dto };

      moviesRepository.findOne.mockResolvedValue(movie);
      ratingsRepository.create.mockReturnValue(created);
      ratingsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result.value).toBe(1);
    });

    it("creates a rating with maximum valid value of 10", async () => {
      const movie = { id: 1, title: "Inception" };
      const dto: CreateRatingDto = { value: 10, movieId: 1 };
      const created = { id: 1, ...dto };

      moviesRepository.findOne.mockResolvedValue(movie);
      ratingsRepository.create.mockReturnValue(created);
      ratingsRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result.value).toBe(10);
    });
  });

  describe("update", () => {
    it("updates rating fields and saves", async () => {
      const existingRating = {
        id: 1,
        value: 7,
        comment: "Good",
        movieId: 1,
        movie: { id: 1 },
      };
      const dto: UpdateRatingDto = { value: 9, comment: "Excellent" };
      const saved = { ...existingRating, ...dto };

      ratingsRepository.findOne.mockResolvedValue(existingRating);
      ratingsRepository.save.mockResolvedValue(saved);

      const result = await service.update(1, dto);

      expect(ratingsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ value: 9, comment: "Excellent" }),
      );
      expect(result).toEqual(saved);
    });

    it("throws NotFoundException when rating does not exist", async () => {
      ratingsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { value: 5 })).rejects.toThrow(
        new NotFoundException("Rating with ID 999 not found"),
      );
    });
  });

  describe("remove", () => {
    it("removes a rating and returns deleted confirmation", async () => {
      const rating = {
        id: 1,
        value: 7,
        comment: "Good",
        movieId: 1,
        movie: { id: 1 },
      };
      ratingsRepository.findOne.mockResolvedValue(rating);
      ratingsRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(ratingsRepository.remove).toHaveBeenCalledWith(rating);
      expect(result).toEqual({ deleted: true });
    });

    it("throws NotFoundException when rating does not exist", async () => {
      ratingsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException("Rating with ID 999 not found"),
      );
    });
  });
});
