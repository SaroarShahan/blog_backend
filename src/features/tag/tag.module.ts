import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { Tag, TagSchema } from './schema/tag.schema';
import { Post, PostSchema } from '../post/schema/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  exports: [TagService],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
