import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { User } from '../../core/user/schema/user.schema';
import { Category } from '../category/schema/category.schema';
import { Tag } from '../tag/schema/tag.schema';
import { MongoidDto } from 'src/common/dto/mongoid.dto';
import { ParamsDto } from 'src/common/dto/params.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<{
    message: string;
    success: boolean;
    data: PostDocument;
  }> {
    try {
      const { title, content, categoryId, tagIds } = createPostDto;

      if (!title || !content) {
        throw new BadRequestException('Title and content are required');
      }

      if (categoryId) {
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }

      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const tagObjectIds = tagIds.map((id) => id);
        const tags = await this.tagModel.find({
          _id: { $in: tagObjectIds },
        });
        if (tags.length !== tagIds.length) {
          throw new NotFoundException('One or more tags not found');
        }
      }

      const post = await this.postModel.create({
        title,
        content,
        user: userId,
        category: categoryId ? categoryId : undefined,
        tags: tagIds && Array.isArray(tagIds) ? tagIds.map((id) => id) : [],
      });

      await this.userModel.updateOne(
        { _id: userId },
        { $push: { posts: post._id } },
      );

      if (categoryId) {
        await this.categoryModel.updateOne(
          { _id: categoryId },
          { $push: { posts: post._id } },
        );
      }

      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const tagObjectIds = tagIds.map((id) => id);
        await this.tagModel.updateMany(
          { _id: { $in: tagObjectIds } },
          { $push: { posts: post._id } },
        );
      }

      return {
        message: 'Post has been created successfully!',
        success: true,
        data: post,
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

  async getAllPosts(params: ParamsDto): Promise<{
    message: string;
    success: boolean;
    data: PostDocument[];
  }> {
    try {
      console.log('Pagination params received:', params);

      const posts = await this.postModel
        .find()
        .populate('user', 'firstName lastName username email')
        .populate('category', 'name description')
        .populate('tags', 'name description')
        .populate('comments', 'content user createdAt')
        .sort({ createdAt: -1 });

      return {
        message: 'Posts have been fetched successfully!',
        success: true,
        data: posts,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getPost(id: MongoidDto['id']): Promise<{
    message: string;
    success: boolean;
    data: PostDocument;
  }> {
    try {
      const post = await this.postModel
        .findById(id)
        .populate('user', 'firstName lastName username email')
        .populate('category', 'name description')
        .populate('tags', 'name description')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'firstName lastName username email',
          },
        });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return {
        message: 'Post has been fetched successfully!',
        success: true,
        data: post,
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

  async updatePost(
    id: MongoidDto['id'],
    updatePostDto: UpdatePostDto,
  ): Promise<{
    message: string;
    success: boolean;
    data: PostDocument;
  }> {
    try {
      const post = await this.postModel.findById(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const { categoryId, tagIds, ...rest } = updatePostDto;
      const updateData: Record<string, unknown> = { ...rest };

      if (typeof categoryId !== 'undefined') {
        if (categoryId) {
          const category = await this.categoryModel.findById(categoryId);
          if (!category) {
            throw new NotFoundException('Category not found');
          }
          updateData.category = categoryId;

          if (post.category) {
            await this.categoryModel.updateOne(
              { _id: post.category },
              { $pull: { posts: post._id } },
            );
          }

          await this.categoryModel.updateOne(
            { _id: categoryId },
            { $push: { posts: post._id } },
          );
        } else {
          if (post.category) {
            await this.categoryModel.updateOne(
              { _id: post.category },
              { $pull: { posts: post._id } },
            );
          }
          updateData.$unset = { category: '' };
        }
      }

      if (typeof tagIds !== 'undefined') {
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          const tagObjectIds = tagIds.map((id) => id);
          const tags = await this.tagModel.find({
            _id: { $in: tagObjectIds },
          });

          if (tags.length !== tagIds.length) {
            throw new NotFoundException('One or more tags not found');
          }
        }

        if (post.tags && post.tags.length > 0) {
          await this.tagModel.updateMany(
            { _id: { $in: post.tags } },
            { $pull: { posts: post._id } },
          );
        }

        if (Array.isArray(tagIds) && tagIds.length > 0) {
          updateData.tags = tagIds.map((id) => id);
          const tagObjectIds = tagIds.map((id) => id);
          await this.tagModel.updateMany(
            { _id: { $in: tagObjectIds } },
            { $push: { posts: post._id } },
          );
        } else {
          updateData.tags = [];
        }
      }

      const updatedPost = await this.postModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );

      if (!updatedPost) {
        throw new NotFoundException('Post not found');
      }

      return {
        message: 'Post has been updated successfully!',
        success: true,
        data: updatedPost,
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

  async deletePost(id: MongoidDto['id']): Promise<{
    message: string;
    success: boolean;
    data: null;
  }> {
    try {
      const post = await this.postModel.findById(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      await this.userModel.updateOne(
        { _id: post.user },
        { $pull: { posts: post._id } },
      );

      if (post.category) {
        await this.categoryModel.updateOne(
          { _id: post.category },
          { $pull: { posts: post._id } },
        );
      }

      if (post.tags && post.tags.length > 0) {
        await this.tagModel.updateMany(
          { _id: { $in: post.tags } },
          { $pull: { posts: post._id } },
        );
      }

      if (post.comments && post.comments.length > 0) {
        const commentModel = this.postModel.db.model('Comment');
        await commentModel.deleteMany({ post: post._id });
      }

      await this.postModel.findByIdAndDelete(id);

      return {
        message: 'Post has been deleted successfully!',
        success: true,
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
