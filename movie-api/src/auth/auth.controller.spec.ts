import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('delegates to AuthService.login using req.user and returns the token', async () => {
      const req = { user: { id: 1, username: 'alice' } };
      const loginDto: LoginDto = { username: 'alice', password: 'password123' };
      const tokenResponse = { access_token: 'signed.jwt.token' };
      service.login.mockResolvedValue(tokenResponse);

      const result = await controller.login(req, loginDto);

      expect(service.login).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(tokenResponse);
    });

    it('passes req.user not the loginDto to the service', async () => {
      const req = { user: { id: 42, username: 'bob' } };
      const loginDto: LoginDto = { username: 'bob', password: 'secret' };
      service.login.mockResolvedValue({ access_token: 'token' });

      await controller.login(req, loginDto);

      expect(service.login).toHaveBeenCalledWith({ id: 42, username: 'bob' });
    });
  });

  describe('register', () => {
    it('delegates to AuthService.register with username and password from dto', async () => {
      const dto: RegisterDto = { username: 'alice', password: 'password123' };
      const created = { id: 1, username: 'alice' };
      service.register.mockResolvedValue(created);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith('alice', 'password123');
      expect(result).toEqual(created);
    });

    it('extracts username and password separately from the dto', async () => {
      const dto: RegisterDto = { username: 'bob', password: 'securepass' };
      service.register.mockResolvedValue({ id: 2, username: 'bob' });

      await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith('bob', 'securepass');
    });
  });
});
