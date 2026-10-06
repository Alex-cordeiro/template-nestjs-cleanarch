import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ListPaginatedQueryDto } from '../pagination/list-paginated-query.dto';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export class ListUsersQueryDto extends ListPaginatedQueryDto {}

export class CreateUserDto {
  @ApiProperty({ example: 'Maria', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Silva', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  last_name: string;

  @ApiProperty({ example: 'maria.silva', minLength: 3, maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(USERNAME_PATTERN, {
    message: 'username deve conter apenas letras, números, ".", "_" e "-"',
  })
  username: string;

  @ApiProperty({ example: 'maria.silva@exemplo.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'senha-segura-123', minLength: 6, maxLength: 72 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(72) // limite do bcrypt
  password: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Maria', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Silva', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name?: string;

  @ApiPropertyOptional({ example: 'maria.silva', minLength: 3, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(USERNAME_PATTERN, {
    message: 'username deve conter apenas letras, números, ".", "_" e "-"',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'maria.silva@exemplo.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: 'nova-senha-123',
    minLength: 6,
    maxLength: 72,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class ListUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty({ example: 1 })
  total: number;
}
