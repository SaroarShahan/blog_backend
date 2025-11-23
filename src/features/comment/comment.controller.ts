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
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import type { Request } from 'express';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/core/auth/auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { MongoidDto } from 'src/common/dto/mongoid.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.commentService.createComment(createCommentDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'postId', required: false, type: String })
  getAllComments(@Query('postId') postId?: MongoidDto['id']) {
    if (postId) {
      return this.commentService.getCommentsByPost(postId);
    }
    return this.commentService.getAllComments();
  }

  @ApiParam({ name: 'id', type: String, description: 'Comment ID' })
  @Get(':id')
  getComment(@Param('id') id: Types.ObjectId) {
    return this.commentService.getComment(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Comment ID' })
  @Patch(':id/update')
  updateComment(
    @Param('id') id: Types.ObjectId,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Comment ID' })
  @Delete(':id/delete')
  deleteComment(@Param('id') id: Types.ObjectId) {
    return this.commentService.deleteComment(id);
  }
}
