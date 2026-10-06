import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  ListUsersQueryDto,
  ListUsersResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from '../../../application/dto/users/user.dto';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByIdUseCase,
  ListUserUseCase,
  UpdateUserUseCase,
} from '../../../application/use-cases';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly createUseCase: CreateUserUseCase,
    private readonly listUseCase: ListUserUseCase,
    private readonly getByIdUseCase: GetUserByIdUseCase,
    private readonly updateUseCase: UpdateUserUseCase,
    private readonly deleteUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'Username ou e-mail já cadastrado' })
  create(@Body() payload: CreateUserDto) {
    return this.createUseCase.execute(payload);
  }

  @Get()
  @ApiOperation({ summary: 'Lista usuários (paginado)' })
  @ApiOkResponse({ type: ListUsersResponseDto })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.listUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiConflictResponse({ description: 'Username ou e-mail já cadastrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateUserDto,
  ) {
    return this.updateUseCase.execute(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiNoContentResponse({ description: 'Usuário removido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUseCase.execute(id);
  }
}
