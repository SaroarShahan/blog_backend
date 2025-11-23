import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { PostModule } from './features/post/post.module';

import { TagModule } from './features/tag/tag.module';
import { CategoryModule } from './features/category/category.module';
import { CommentModule } from './features/comment/comment.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    PostModule,
    CategoryModule,
    TagModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
