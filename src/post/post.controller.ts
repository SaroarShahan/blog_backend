import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';
import type { Request } from 'express';

import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/core/auth/auth.guard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.postService.createPost(createPostDto, userId);
  }

  @Get()
  getAllPosts() {
    return this.postService.getAllPosts();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Get(':id')
  getPost(@Param('id') id: Types.ObjectId) {
    return this.postService.getPost(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Patch(':id/update')
  updatePost(
    @Param('id') id: Types.ObjectId,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Delete(':id/delete')
  deletePost(@Param('id') id: Types.ObjectId) {
    return this.postService.deletePost(id);
  }
}
