import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender?: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  postsIds: Types.ObjectId[];

  @Prop({ default: [] })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
