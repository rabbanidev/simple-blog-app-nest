import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogModule } from './modules/features/blog/blog.module';
import { appConfig, databaseConfig, jwtConfig, validate } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/core/user/user.module';
import { AuthModule } from './modules/core/auth/auth.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    BlogModule,

    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
