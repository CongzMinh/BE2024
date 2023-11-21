import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { LoginWithWalletDto } from './dto/login-wallet.dto';
import { ResponseLogin } from './dto/respone-login.dto';
import { v4 as uuidv4 } from 'uuid';
import { checkRecoverSameAddress } from 'src/shared/helper/utils';
import { httpErrors } from 'src/shared/helper/exceptions';
import { JwtPayload } from './jwt.payload';
import { createHash } from 'crypto';
import { AUTH_CACHE_PREFIX, jwtConstants } from './auth.constants';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { userId: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUserById(id: number): Promise<any> {
    const user = await this.userService.findOne(id);
    if (!user) return null;
    const { password, ...result } = user;
    console.log('======== password : ', password);
    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      console.log('======== password : ', password);
      return result;
    }
    return null;
  }

  async login(user: UserEntity) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateAccessToken(payload: JwtPayload): { accessToken: string } {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async generateRefreshToken(
    accessToken: string,
  ): Promise<{ refreshToken: string }> {
    const refreshToken = uuidv4();
    const hashedAccessToken = createHash('sha256')
      .update(accessToken)
      .digest('hex');
    await this.cacheManager.set(
      `${AUTH_CACHE_PREFIX}${refreshToken}`,
      hashedAccessToken,
      jwtConstants.refreshTokenExpiry,
    );
    return {
      refreshToken: refreshToken,
    };
  }
}
