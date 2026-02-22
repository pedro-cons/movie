import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { ILike, In, Repository } from "typeorm";
import { MoviesService } from "./movies.service";
import { Movie } from "./entities/movie.entity";
import { Actor } from "../actors/entities/actor.entity";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe("MoviesService", () => {
  let service: MoviesService;
  let moviesRepository: MockRepository<Movie>;
  let actorsRepository: MockRepository<Actor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: createMockRepository<Movie>(),
        },
        {
          provide: getRepositoryToken(Actor),
          useValue: createMockRepository<Actor>(),
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<MockRepository<Movie>>(
      getRepositoryToken(Movie),
    );
    actorsRepository = module.get<MockRepository<Actor>>(
      getRepositoryToken(Actor),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns paginated movies without search term", async () => {
      const movies = [
        { id: 1, title: "Inception", actors: [], ratings: [] },
        { id: 2, title: "Interstellar", actors: [], ratings: [] },
      ];
      moviesRepository.findAndCount.mockResolvedValue([movies, 2]);

      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(moviesRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["actors", "ratings"],
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual({ data: movies, total: 2, page: 1, limit: 10 });
    });

    it("applies ILIKE filter when search term is provided", async () => {
      const movies = [{ id: 1, title: "Inception", actors: [], ratings: [] }];
      moviesRepository.findAndCount.mockResolvedValue([movies, 1]);

      const query: PaginationQueryDto = { page: 1, limit: 10, search: "incep" };
      const result = await service.findAll(query);

      expect(moviesRepository.findAndCount).toHaveBeenCalledWith({
        where: { title: ILike("%incep%") },
        relations: ["actors", "ratings"],
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result.total).toBe(1);
    });

    it("calculates skip offset correctly for page 2", async () => {
      moviesRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 5 });

      expect(moviesRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it("uses default page and limit when not provided", async () => {
      moviesRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("returns empty data array when no movies exist", async () => {
      moviesRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("findOne", () => {
    it("returns a movie when found by id", async () => {
      const movie = { id: 1, title: "Inception", actors: [], ratings: [] };
      moviesRepository.findOne.mockResolvedValue(movie);

      const result = await service.findOne(1);

      expect(moviesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["actors", "ratings"],
      });
      expect(result).toEqual(movie);
    });

    it("throws NotFoundException when movie does not exist", async () => {
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("Movie with ID 999 not found"),
      );
    });

    it("throws NotFoundException with the correct id in message", async () => {
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Movie with ID 42 not found",
      );
    });
  });

  describe("getActors", () => {
    it("returns the actors for a movie", async () => {
      const actors = [
        { id: 1, firstName: "Tom", lastName: "Hanks" },
        { id: 2, firstName: "Cate", lastName: "Blanchett" },
      ];
      const movie = { id: 1, title: "Inception", actors };
      moviesRepository.findOne.mockResolvedValue(movie);

      const result = await service.getActors(1);

      expect(moviesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["actors"],
      });
      expect(result).toEqual(actors);
    });

    it("throws NotFoundException when movie does not exist", async () => {
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.getActors(999)).rejects.toThrow(
        new NotFoundException("Movie with ID 999 not found"),
      );
    });

    it("returns empty array when movie has no actors", async () => {
      const movie = { id: 1, title: "Solo Film", actors: [] };
      moviesRepository.findOne.mockResolvedValue(movie);

      const result = await service.getActors(1);

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates a movie without actors", async () => {
      const dto: CreateMovieDto = { title: "New Movie", genre: "Drama" };
      const created = { id: 1, title: "New Movie", genre: "Drama", actors: [] };

      moviesRepository.create.mockReturnValue(created);
      moviesRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(moviesRepository.create).toHaveBeenCalledWith({
        title: "New Movie",
        genre: "Drama",
      });
      expect(actorsRepository.findBy).not.toHaveBeenCalled();
      expect(moviesRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it("creates a movie and links actors by their ids", async () => {
      const dto: CreateMovieDto = { title: "New Movie", actorIds: [1, 2] };
      const actors = [
        { id: 1, firstName: "Tom", lastName: "Hanks" },
        { id: 2, firstName: "Cate", lastName: "Blanchett" },
      ];
      const created = { id: 1, title: "New Movie", actors: [] };
      const saved = { ...created, actors };

      moviesRepository.create.mockReturnValue(created);
      actorsRepository.findBy.mockResolvedValue(actors);
      moviesRepository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(actorsRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors }),
      );
      expect(result).toEqual(saved);
    });

    it("does not call findByIds when actorIds is an empty array", async () => {
      const dto: CreateMovieDto = { title: "New Movie", actorIds: [] };
      const created = { id: 1, title: "New Movie", actors: [] };

      moviesRepository.create.mockReturnValue(created);
      moviesRepository.save.mockResolvedValue(created);

      await service.create(dto);

      expect(actorsRepository.findBy).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("updates the movie fields", async () => {
      const existingMovie = {
        id: 1,
        title: "Old Title",
        genre: "Action",
        actors: [],
      };
      const dto: UpdateMovieDto = { title: "New Title" };
      const saved = { ...existingMovie, title: "New Title" };

      moviesRepository.findOne.mockResolvedValue(existingMovie);
      moviesRepository.save.mockResolvedValue(saved);

      const result = await service.update(1, dto);

      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New Title" }),
      );
      expect(result).toEqual(saved);
    });

    it("replaces actors when actorIds is provided", async () => {
      const existingMovie = {
        id: 1,
        title: "Movie",
        actors: [{ id: 1, firstName: "Tom", lastName: "Hanks" }],
      };
      const newActors = [{ id: 2, firstName: "Cate", lastName: "Blanchett" }];
      const dto: UpdateMovieDto = { actorIds: [2] };

      moviesRepository.findOne.mockResolvedValue(existingMovie);
      actorsRepository.findBy.mockResolvedValue(newActors);
      moviesRepository.save.mockResolvedValue({
        ...existingMovie,
        actors: newActors,
      });

      await service.update(1, dto);

      expect(actorsRepository.findBy).toHaveBeenCalledWith({ id: In([2]) });
      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: newActors }),
      );
    });

    it("clears actors when actorIds is an empty array", async () => {
      const existingMovie = {
        id: 1,
        title: "Movie",
        actors: [{ id: 1, firstName: "Tom", lastName: "Hanks" }],
      };
      const dto: UpdateMovieDto = { actorIds: [] };

      moviesRepository.findOne.mockResolvedValue(existingMovie);
      moviesRepository.save.mockResolvedValue({ ...existingMovie, actors: [] });

      await service.update(1, dto);

      expect(actorsRepository.findBy).not.toHaveBeenCalled();
      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: [] }),
      );
    });

    it("does not modify actors when actorIds is undefined", async () => {
      const existingActors = [{ id: 1, firstName: "Tom", lastName: "Hanks" }];
      const existingMovie = { id: 1, title: "Movie", actors: existingActors };
      const dto: UpdateMovieDto = { title: "Updated Title" };

      moviesRepository.findOne.mockResolvedValue(existingMovie);
      moviesRepository.save.mockResolvedValue({
        ...existingMovie,
        title: "Updated Title",
      });

      await service.update(1, dto);

      expect(actorsRepository.findBy).not.toHaveBeenCalled();
      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: existingActors }),
      );
    });

    it("throws NotFoundException when movie does not exist", async () => {
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: "X" })).rejects.toThrow(
        new NotFoundException("Movie with ID 999 not found"),
      );
    });
  });

  describe("remove", () => {
    it("removes a movie and returns deleted confirmation", async () => {
      const movie = { id: 1, title: "Inception", actors: [], ratings: [] };
      moviesRepository.findOne.mockResolvedValue(movie);
      moviesRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(moviesRepository.remove).toHaveBeenCalledWith(movie);
      expect(result).toEqual({ deleted: true });
    });

    it("throws NotFoundException when movie does not exist", async () => {
      moviesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException("Movie with ID 999 not found"),
      );
    });
  });
});
