import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './schema/comment.schema';
import { Post } from '../post/schema/post.schema';
import { User } from '../core/user/schema/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<{
    message: string;
    status: boolean;
    data: CommentDocument;
  }> {
    try {
      const { content, postId, parentCommentId } = createCommentDto;

      if (!content || !postId) {
        throw new BadRequestException('Content and postId are required');
      }

      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (parentCommentId) {
        const parentComment = await this.commentModel.findById(parentCommentId);
        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }

      const comment = await this.commentModel.create({
        content,
        user: new Types.ObjectId(userId),
        post: new Types.ObjectId(postId),
        parentComment: parentCommentId
          ? new Types.ObjectId(parentCommentId)
          : undefined,
      });

      await this.postModel.updateOne(
        { _id: postId },
        { $push: { comments: comment._id } },
      );

      await this.userModel.updateOne(
        { _id: userId },
        { $push: { comments: comment._id } },
      );

      if (parentCommentId) {
        await this.commentModel.updateOne(
          { _id: parentCommentId },
          { $push: { replies: comment._id } },
        );
      }

      return {
        message: 'Comment has been created successfully!',
        status: true,
        data: comment,
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

  async getAllComments(): Promise<{
    message: string;
    status: boolean;
    data: CommentDocument[];
  }> {
    try {
      const comments = await this.commentModel
        .find()
        .populate('user', 'firstName lastName username email')
        .populate('post', 'title')
        .populate('parentComment', 'content')
        .populate('replies', 'content user')
        .sort({ createdAt: -1 });

      return {
        message: 'Comments have been fetched successfully!',
        status: true,
        data: comments,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getComment(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: CommentDocument;
  }> {
    try {
      const comment = await this.commentModel
        .findById(id)
        .populate('user', 'firstName lastName username email')
        .populate('post', 'title content')
        .populate('parentComment', 'content user')
        .populate('replies', 'content user createdAt');

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return {
        message: 'Comment has been fetched successfully!',
        status: true,
        data: comment,
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

  async getCommentsByPost(postId: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: CommentDocument[];
  }> {
    try {
      const post = await this.postModel.findById(postId);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const comments = await this.commentModel
        .find({ post: post._id, parentComment: null })
        .populate('user', 'firstName lastName username email')
        .populate({
          path: 'replies',
          populate: {
            path: 'user',
            select: 'firstName lastName username email',
          },
        })
        .sort({ createdAt: -1 });

      return {
        message: 'Comments have been fetched successfully!',
        status: true,
        data: comments,
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

  async updateComment(
    id: Types.ObjectId,
    updateCommentDto: UpdateCommentDto,
  ): Promise<{
    message: string;
    status: boolean;
    data: CommentDocument;
  }> {
    try {
      const comment = await this.commentModel.findById(id);

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const { content, postId, parentCommentId } = updateCommentDto;
      const updateData: Record<string, unknown> = {};

      if (content !== undefined) {
        updateData.content = content;
      }

      if (postId) {
        const post = await this.postModel.findById(postId);
        if (!post) {
          throw new NotFoundException('Post not found');
        }
        updateData.post = new Types.ObjectId(postId);
      }

      if (parentCommentId !== undefined) {
        if (parentCommentId) {
          const parentComment =
            await this.commentModel.findById(parentCommentId);
          if (!parentComment) {
            throw new NotFoundException('Parent comment not found');
          }
          updateData.parentComment = new Types.ObjectId(parentCommentId);
        } else {
          updateData.parentComment = null;
        }
      }

      const updatedComment = await this.commentModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );

      if (!updatedComment) {
        throw new NotFoundException('Comment not found');
      }

      return {
        message: 'Comment has been updated successfully!',
        status: true,
        data: updatedComment,
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

  async deleteComment(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: null;
  }> {
    try {
      const comment = await this.commentModel.findById(id);

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      await this.postModel.updateOne(
        { _id: comment.post },
        { $pull: { comments: comment._id } },
      );

      await this.userModel.updateOne(
        { _id: comment.user },
        { $pull: { comments: comment._id } },
      );

      if (comment.parentComment) {
        await this.commentModel.updateOne(
          { _id: comment.parentComment },
          { $pull: { replies: comment._id } },
        );
      }

      if (comment.replies && comment.replies.length > 0) {
        await this.commentModel.deleteMany({
          _id: { $in: comment.replies },
        });
      }

      await this.commentModel.findByIdAndDelete(id);

      return {
        message: 'Comment has been deleted successfully!',
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
