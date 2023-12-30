import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from './jwt.payload';
import { createHash } from 'crypto';
import { AUTH_CACHE_PREFIX, jwtConstants } from './auth.constants';
import { Cache } from 'cache-manager';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as otpGenerator from 'otp-generator';
import { MailerService } from '@nestjs-modules/mailer';
import { LessThan } from 'typeorm';
import { OtpRepository } from './repositories/otp.respository';
import { UserRepository } from '../user/repositories/user.repository';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private otpRepo: OtpRepository,
    private userRepo: UserRepository,
  ) {}

  //signIn
  async signIn(loginDto: LoginDto): Promise<any> {
    const userByEmail = await this.userService.findByEmail(loginDto.email);
    if (!userByEmail) {
      throw new UnauthorizedException();
    }

    //check password
    const isMatchPassword = await bcrypt.compare(
      loginDto.password,
      userByEmail.password,
    );
    if (!isMatchPassword) {
      throw new BadRequestException();
    }

    const payload = {
      userId: userByEmail.id,
      email: userByEmail.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  //Register
  async register(createUser: CreateUserDto): Promise<any> {
    if (!createUser.email && !createUser.phoneNumber) {
      throw new BadRequestException();
    }

    //check email axist
    const userByEmail = await this.userService.findByEmail(createUser.email);
    if (userByEmail) {
      throw new BadRequestException('Email ready axist!');
    }

    //check phonenumber axist
    const userByPhoneNumber = await this.userService.findByPhoneNumber(
      createUser.phoneNumber,
    );
    if (userByPhoneNumber) {
      throw new BadRequestException('Phone number ready axist!');
    }

    if (createUser.phoneNumber === '') {
      createUser.phoneNumber = null;
    }

    if (createUser.email === '') {
      createUser.email = null;
    }

    //save to db
    const savedUser = await this.userService.createUser(createUser);

    //generate Jwt token
    const payload = { userId: savedUser.id, email: savedUser.email };
    return this.generateAccessToken(payload);
  }

  //Forgot password by email
  async sendEmailOtp(email: string) {
    //check user's email axist
    const userByEmail = await this.userService.findByEmail(email);
    if (!userByEmail) {
      throw new BadRequestException('Email does not exist!');
    }

    //create Otp
    const otp = await this.generateOtp();

    //save otp to db
    const userByEmailOtp = await this.otpRepo.findOne({
      where: { email: email },
    });
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
    if (userByEmailOtp) {
      await this.otpRepo.delete({ email: userByEmailOtp.email });
    }
    await this.otpRepo.save({ email, otp, expiredAt });

    //send otp to email
    await this.mailerService.sendMail({
      to: userByEmail.email,
      template: './sendEmailOtp',
      context: {
        code: otp,
      },
    });
  }

  async validateOtp(email: string, otp: string): Promise<any> {
    //clear otp

    await this.otpRepo.delete({ expiredAt: LessThan(new Date()) });

    const userByEmailOtp = await this.otpRepo.findOne({
      where: { email: email },
    });
    console.log(userByEmailOtp);
    if (userByEmailOtp && userByEmailOtp.otp == otp) {
      return 'Otp is valid';
    } else {
      throw new NotFoundException('Otp is invalid');
    }
  }

  async resetPassword(email: string, password: string): Promise<any> {
    const userByEmailOtp = await this.otpRepo.findOne({
      where: { email },
    });

    const userByEmail = await this.userService.findByEmail(email);

    if (userByEmailOtp) {
      userByEmail.password = password;
      const salt = await bcrypt.genSalt(+process.env.APP_BCRYPT_SALT);
      userByEmail.password = await bcrypt.hash(
        userByEmail.password || userByEmail.password,
        salt,
      );
      return this.userRepo.save(userByEmail);
    }
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
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateAccessToken(payload: JwtPayload): { accessToken: string } {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  generateOtp(): string {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
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