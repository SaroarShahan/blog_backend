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

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from 'src/common/dto/user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  createUser(@Body() createUserDto: UserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Get(':id/posts')
  getPostsByUser(@Param('id') id: Types.ObjectId) {
    return this.userService.getPostsByUser(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Get(':id')
  getUser(@Param('id') id: Types.ObjectId) {
    return this.userService.getUser(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Patch(':id/update')
  updateUser(
    @Param('id') id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @Delete(':id/delete')
  deleteUser(@Param('id') id: Types.ObjectId) {
    return this.userService.deleteUser(id);
  }
}
