import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { TopicsModule } from './modules/topics/topics.module';
import { TagsModule } from './modules/tags/tags.module';
import { MoodsModule } from './modules/moods/moods.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { AuthTokensModule } from './modules/auth-tokens/auth-tokens.module';
import { EmailThrottlerGuard } from './common/guards/email-throttler.guard';
import { PostLikesModule } from './modules/likes/post-likes.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60,
          limit: 10,
        },
        {
          name: 'auth',
          ttl: 60,
          limit: 5,
        },
        {
          name: 'passwordReset',
          ttl: 300,
          limit: 3,
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ScheduleModule.forRoot(),

    UsersModule,
    AuthModule,
    AuthTokensModule,
    PostsModule,
    TopicsModule,
    TagsModule,
    MoodsModule,
    CleanupModule,
    PostLikesModule,
    CommentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useClass: EmailThrottlerGuard,
    },
  ],
})
export class AppModule {}
