import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

const mockUsersService = {
  findByUsername: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('returns user data without password when credentials are valid', async () => {
      const user = { id: 1, username: 'alice', password: 'hashed_password' };
      mockUsersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('alice', 'correct_password');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('alice');
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'hashed_password');
      expect(result).toEqual({ id: 1, username: 'alice' });
      expect(result).not.toHaveProperty('password');
    });

    it('returns null when the password does not match', async () => {
      const user = { id: 1, username: 'alice', password: 'hashed_password' };
      mockUsersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('alice', 'wrong_password');

      expect(result).toBeNull();
    });

    it('returns null when the user does not exist', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'any_password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access_token signed with username and id as sub', async () => {
      const user = { id: 1, username: 'alice' };
      mockJwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({ username: 'alice', sub: 1 });
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('uses the user id as the sub claim', async () => {
      const user = { id: 42, username: 'bob' };
      mockJwtService.sign.mockReturnValue('another.token');

      await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 42 }),
      );
    });
  });

  describe('register', () => {
    it('hashes the password and creates a new user', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersService.create.mockResolvedValue({ id: 1, username: 'alice' });

      const result = await service.register('alice', 'password123');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('alice');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersService.create).toHaveBeenCalledWith('alice', 'hashed_password');
      expect(result).toEqual({ id: 1, username: 'alice' });
    });

    it('returns only id and username without hashed password', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersService.create.mockResolvedValue({
        id: 1,
        username: 'alice',
        password: 'hashed_password',
      });

      const result = await service.register('alice', 'password123');

      expect(result).toEqual({ id: 1, username: 'alice' });
      expect(result).not.toHaveProperty('password');
    });

    it('throws ConflictException when username already exists', async () => {
      const existingUser = { id: 1, username: 'alice', password: 'hashed' };
      mockUsersService.findByUsername.mockResolvedValue(existingUser);

      await expect(service.register('alice', 'password123')).rejects.toThrow(
        new ConflictException('Username already exists'),
      );
    });

    it('does not create user when username is already taken', async () => {
      mockUsersService.findByUsername.mockResolvedValue({ id: 1, username: 'alice' });

      await expect(service.register('alice', 'password123')).rejects.toThrow(ConflictException);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });
});
