import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag, TagDocument } from './schema/tag.schema';
import { Post, PostDocument } from '../post/schema/post.schema';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async createTag(createTagDto: CreateTagDto): Promise<{
    message: string;
    status: boolean;
    data: TagDocument;
  }> {
    try {
      const { name, description } = createTagDto;

      if (!name) {
        throw new BadRequestException('Tag name is required');
      }

      const tag = await this.tagModel.create({
        name,
        description,
      });

      return {
        message: 'Tag has been created successfully!',
        status: true,
        data: tag,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new BadRequestException('Tag name already exists');
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getAllTags(): Promise<{
    message: string;
    status: boolean;
    data: TagDocument[];
  }> {
    try {
      const tags = await this.tagModel.find().populate('posts');

      return {
        message: 'Tags have been fetched successfully!',
        status: true,
        data: tags,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getTag(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: TagDocument;
  }> {
    try {
      const tag = await this.tagModel
        .findById(id)
        .populate('posts', 'title content');

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      return {
        message: 'Tag has been fetched successfully!',
        status: true,
        data: tag,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async updateTag(
    id: Types.ObjectId,
    updateTagDto: UpdateTagDto,
  ): Promise<{
    message: string;
    status: boolean;
    data: TagDocument;
  }> {
    try {
      const tag = await this.tagModel.findByIdAndUpdate(id, updateTagDto, {
        new: true,
      });

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      return {
        message: 'Tag has been updated successfully!',
        status: true,
        data: tag,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new BadRequestException('Tag name already exists');
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getPostsByTag(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: PostDocument[];
  }> {
    try {
      const tag = await this.tagModel.findById(id);
      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      const posts = await this.postModel
        .find({ tags: tag._id })
        .populate('user', 'firstName lastName username email')
        .populate('category', 'name description')
        .populate('tags', 'name description')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'firstName lastName username email',
          },
        })
        .sort({ createdAt: -1 });

      return {
        message: 'Posts have been fetched successfully!',
        status: true,
        data: posts,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async deleteTag(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: null;
  }> {
    try {
      const tag = await this.tagModel.findById(id);

      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      await this.postModel.updateMany({ tags: id }, { $pull: { tags: id } });

      await this.tagModel.findByIdAndDelete(id);

      return {
        message: 'Tag has been deleted successfully!',
        status: true,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }
}
