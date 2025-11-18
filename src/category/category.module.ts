import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './schema/category.schema';
import { Post, PostSchema } from '../post/schema/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  exports: [CategoryService],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
