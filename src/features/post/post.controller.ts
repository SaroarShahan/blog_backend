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
import type { Request } from 'express';

import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/core/auth/auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParamsDto } from 'src/common/dto/params.dto';
import { CommentService } from '../comment/comment.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

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

  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Get(':id/comments')
  getCommentsByPost(@Param('id') id: ParamsDto['id']): Promise<{
    message: string;
    success: boolean;
    data: any[];
  }> {
    return this.commentService.getCommentsByPost(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Get(':id')
  getPost(@Param('id') id: ParamsDto['id']) {
    return this.postService.getPost(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Patch(':id/update')
  updatePost(
    @Param('id') id: ParamsDto['id'],
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Post ID' })
  @Delete(':id/delete')
  deletePost(@Param('id') id: ParamsDto['id']) {
    return this.postService.deletePost(id);
  }
}
