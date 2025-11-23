import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';
import { Post, PostDocument } from '../post/schema/post.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<{
    message: string;
    status: boolean;
    data: CategoryDocument;
  }> {
    try {
      const { name, description } = createCategoryDto;

      if (!name) {
        throw new BadRequestException('Category name is required');
      }

      const category = await this.categoryModel.create({
        name,
        description,
      });

      return {
        message: 'Category has been created successfully!',
        status: true,
        data: category,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new BadRequestException('Category name already exists');
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getAllCategories(): Promise<{
    message: string;
    status: boolean;
    data: CategoryDocument[];
  }> {
    try {
      const categories = await this.categoryModel.find();

      return {
        message: 'Categories have been fetched successfully!',
        status: true,
        data: categories,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getCategory(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: CategoryDocument;
  }> {
    try {
      const category = await this.categoryModel
        .findById(id)
        .populate('posts', 'title content');

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return {
        message: 'Category has been fetched successfully!',
        status: true,
        data: category,
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

  async updateCategory(
    id: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<{
    message: string;
    status: boolean;
    data: CategoryDocument;
  }> {
    try {
      const category = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true },
      );

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return {
        message: 'Category has been updated successfully!',
        status: true,
        data: category,
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
        throw new BadRequestException('Category name already exists');
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async getPostsByCategory(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: PostDocument[];
  }> {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const posts = await this.postModel
        .find({ category: category._id })
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

  async deleteCategory(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: null;
  }> {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      await this.postModel.updateMany(
        { category: id },
        { $unset: { category: '' } },
      );

      await this.categoryModel.findByIdAndDelete(id);

      return {
        message: 'Category has been deleted successfully!',
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
