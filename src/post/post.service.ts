import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { User } from '../core/user/schema/user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<{
    message: string;
    status: boolean;
    data: PostDocument;
  }> {
    try {
      const { title, content } = createPostDto;

      if (!title || !content) {
        throw new BadRequestException('Title and content are required');
      }

      const post = await this.postModel.create({
        title,
        content,
        user: new Types.ObjectId(userId),
      });

      // Update user's postsIds array
      await this.userModel.updateOne(
        { _id: userId },
        { $push: { postsIds: post._id } },
      );

      return {
        message: 'Post has been created successfully!',
        status: true,
        data: post,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getAllPosts(): Promise<{
    message: string;
    status: boolean;
    data: PostDocument[];
  }> {
    try {
      const posts = await this.postModel
        .find()
        .populate('user', 'firstName lastName username email');

      return {
        message: 'Posts have been fetched successfully!',
        status: true,
        data: posts,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getPost(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: PostDocument;
  }> {
    try {
      const post = await this.postModel
        .findById(id)
        .populate('user', 'firstName lastName username email');

      return {
        message: 'Post has been fetched successfully!',
        status: true,
        data: post as PostDocument,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async updatePost(
    id: Types.ObjectId,
    updatePostDto: UpdatePostDto,
  ): Promise<{
    message: string;
    status: boolean;
    data: PostDocument;
  }> {
    try {
      const post = await this.postModel.findByIdAndUpdate(id, updatePostDto, {
        new: true,
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return {
        message: 'Post has been updated successfully!',
        status: true,
        data: post,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async deletePost(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: null;
  }> {
    try {
      const post = await this.postModel.findById(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Remove post ID from user's postsIds array
      // Use post._id to ensure exact match with what was stored in postsIds
      await this.userModel.updateOne(
        { _id: post.user },
        { $pull: { postsIds: post._id } },
      );

      // Delete the post
      await this.postModel.findByIdAndDelete(id);

      return {
        message: 'Post has been deleted successfully!',
        status: true,
        data: null,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }
}
