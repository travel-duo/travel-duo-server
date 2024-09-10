import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { SortDto } from '@/common/dto/sort.dto';
import { SearchResponseDto } from '@/common/dto/search-response.dto';
import { SearchFilterV2Dto } from '@/common/dto/search-filter-v2.dto';
import { FilterExpression } from '@/common/utils/filter/types';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { AdminTeacherGuard } from '@/auth/guards/admin-teacher.guard';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';

@Controller({
  path: 'users',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '새로운 사용자 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<Users> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '필터링, 페이지네이션, 정렬을 포함한 모든 사용자 조회',
  })
  async findAll(
    @Query() searchFilterDto: SearchFilterV2Dto,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortDto,
  ): Promise<SearchResponseDto<Users>> {
    const filter: FilterExpression = JSON.parse(
      decodeURIComponent(searchFilterDto.filter),
    );
    return await this.usersService.findAll(filter, paginationDto, sortDto);
  }

  @Get('email/:email')
  @UseGuards(AdminTeacherGuard)
  @ApiOperation({ summary: '이메일로 특정 사용자 조회' })
  async findOneByEmail(@Param('email') email: string): Promise<Users> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  async findMe(@Req() req: AuthRequest): Promise<Users> {
    const userId = getUserId(req);
    return await this.usersService.findOne(userId);
  }

  @Get(':userId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'ID로 특정 사용자 조회' })
  async findOne(@Param('userId', ParseIntPipe) userId: bigint): Promise<Users> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

  @Put(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ID로 사용자 정보 업데이트' })
  async update(
    @Param('userId', ParseIntPipe) userId: bigint,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Users> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return await this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'ID로 사용자 삭제' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('userId', ParseIntPipe) userId: bigint): Promise<void> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    await this.usersService.remove(userId);
  }
}
