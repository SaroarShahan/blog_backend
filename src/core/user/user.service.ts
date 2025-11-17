import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import { UserDto } from 'src/common/dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne({ email });

      return user;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async saveUser(user: UserDto): Promise<User> {
    const createdUser = await this.userModel.create(user);

    const userWithoutPassword = await this.userModel
      .findById(createdUser._id)
      .select('-password');

    if (!userWithoutPassword) {
      throw new BadRequestException('Failed to create user');
    }

    return userWithoutPassword;
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    return hashedPassword;
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async saveRefreshToken(id: Types.ObjectId, token: string): Promise<void> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens.push(token);

    if (user.refreshTokens.length > 2) {
      user.refreshTokens.splice(0, 1); // Remove the oldest token
    }

    await user.save();
  }

  async createUser(payload: UserDto): Promise<{
    message: string;
    status: boolean;
    data: UserDocument;
  }> {
    try {
      const { username, email, password, ...restPayload } = payload;

      if (!username || !email || !password) {
        throw new BadRequestException(
          'Username, email, and password are required',
        );
      }

      const existingUser = await this.findByEmail(email);

      if (existingUser) throw new BadRequestException('User already exists');

      const hashedPassword = await this.hashPassword(password);

      const user = await this.saveUser({
        ...restPayload,
        username,
        email,
        password: hashedPassword,
      });

      return {
        message: 'User has been created successfully!',
        status: true,
        data: user as UserDocument,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async findAllUsers(): Promise<{
    message: string;
    status: boolean;
    data: UserDocument[];
  }> {
    try {
      const users = await this.userModel.find().select('-password');

      return {
        message: 'Users have been fetched successfully!',
        status: true,
        data: users,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async findUser(id: Types.ObjectId): Promise<{
    message: string;
    status: boolean;
    data: UserDocument | null;
  }> {
    try {
      const user = await this.userModel.findById(id).select('-password');

      return {
        message: 'User has been fetched successfully!',
        status: true,
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    status: boolean;
    data: UserDocument | null;
  }> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User has been updated successfully!',
        status: true,
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async deleteUser(id: string): Promise<{
    message: string;
    status: boolean;
    data: null;
  }> {
    try {
      const user = await this.userModel.findByIdAndDelete(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User has been deleted successfully!',
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
