import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './core/user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';

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
