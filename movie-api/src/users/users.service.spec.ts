import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByUsername", () => {
    it("returns a user when found by username", async () => {
      const user: User = {
        id: 1,
        username: "alice",
        password: "hashed_password",
        createdAt: new Date(),
      };
      usersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByUsername("alice");

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: "alice" },
      });
      expect(result).toEqual(user);
    });

    it("returns null when no user is found for the given username", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername("unknown");

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: "unknown" },
      });
      expect(result).toBeNull();
    });

    it("searches by the exact username provided", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await service.findByUsername("specificUser");

      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { username: "specificUser" } }),
      );
    });
  });

  describe("create", () => {
    it("creates and saves a user with the given username and hashed password", async () => {
      const newUser: User = {
        id: 1,
        username: "alice",
        password: "hashed_password",
        createdAt: new Date(),
      };

      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.create("alice", "hashed_password");

      expect(usersRepository.create).toHaveBeenCalledWith({
        username: "alice",
        password: "hashed_password",
      });
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it("persists the user to the database by calling save", async () => {
      const newUser: User = {
        id: 2,
        username: "bob",
        password: "another_hash",
        createdAt: new Date(),
      };

      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create("bob", "another_hash");

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
    });

    it("returns the saved user entity including the generated id", async () => {
      const savedUser: User = {
        id: 10,
        username: "carol",
        password: "carol_hash",
        createdAt: new Date(),
      };

      usersRepository.create.mockReturnValue({
        username: "carol",
        password: "carol_hash",
      });
      usersRepository.save.mockResolvedValue(savedUser);

      const result = await service.create("carol", "carol_hash");

      expect(result.id).toBe(10);
      expect(result.username).toBe("carol");
    });
  });
});
