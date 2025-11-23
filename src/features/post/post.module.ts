import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './schema/post.schema';
import { User, UserSchema } from '../../core/user/schema/user.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { Tag, TagSchema } from '../tag/schema/tag.schema';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    CommentModule,
  ],
  exports: [PostService],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
