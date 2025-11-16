export class UserDto {
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
  gender?: string;
  postsIds?: string[];
  refreshToken?: string[];
}
