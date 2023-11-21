import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SeederModule } from './modules/seeder/seeder.module';
// import { typeOrmConfig } from './configs/typeorm.config';
import { dataSourceOptions } from './database/data-source';
// import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './modules/auth/roles.guard';
// import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerExampleModule } from './modules/throttler/throttler.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10000,
    }),
    ConfigModule,
    AuthModule,
    SeederModule,
    ThrottlerExampleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer;
  }
}
