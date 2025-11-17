import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'token' })
  refreshToken: string;
}
