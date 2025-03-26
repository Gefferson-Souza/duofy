import { UserResponseDto } from '../modules/auth/dto/user-response.dto';

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
    }
  }
}
