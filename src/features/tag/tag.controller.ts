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

import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AuthGuard } from 'src/core/auth/auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { MongoidDto } from 'src/common/dto/mongoid.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagService.createTag(createTagDto);
  }

  @Get()
  getAllTags() {
    return this.tagService.getAllTags();
  }

  @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
  @Get(':id/posts')
  getPostsByTag(@Param('id') id: MongoidDto['id']) {
    return this.tagService.getPostsByTag(id);
  }

  @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
  @Get(':id')
  getTag(@Param('id') id: MongoidDto['id']) {
    return this.tagService.getTag(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
  @Patch(':id/update')
  updateTag(
    @Param('id') id: MongoidDto['id'],
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.updateTag(id, updateTagDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'Tag ID' })
  @Delete(':id/delete')
  deleteTag(@Param('id') id: MongoidDto['id']) {
    return this.tagService.deleteTag(id);
  }
}
