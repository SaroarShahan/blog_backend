import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/core/auth/auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @Get(':id/posts')
  getPostsByCategory(@Param('id') id: Types.ObjectId) {
    return this.categoryService.getPostsByCategory(id);
  }

  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @Get(':id')
  getCategory(@Param('id') id: Types.ObjectId) {
    return this.categoryService.getCategory(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @Patch(':id/update')
  updateCategory(
    @Param('id') id: Types.ObjectId,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @Delete(':id/delete')
  deleteCategory(@Param('id') id: Types.ObjectId) {
    return this.categoryService.deleteCategory(id);
  }
}
