import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { SortDto } from '@/common/dto/sort.dto';
import { SearchFilterService } from '@/common/search-filter.service';
import { SearchResponseDto } from '@/common/dto/search-response.dto';
import { FilterExpression } from '@/common/utils/filter/types';
import { snakeCase as _snakeCase } from 'lodash';

@Injectable()
export class UserService extends SearchFilterService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {
    super();
  }

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(
    filter: FilterExpression,
    paginationDto: PaginationDto,
    sortDto: SortDto,
  ): Promise<SearchResponseDto<Users>> {
    const entityName = this.usersRepository.metadata.tableName;
    const queryBuilder = this.usersRepository.createQueryBuilder(entityName);
    return this.searchAndPaginateResults(
      queryBuilder,
      entityName,
      filter,
      paginationDto,
      sortDto,
      this.getAllowedFields(),
    );
  }

  async findOne(id: bigint): Promise<Users> {
    const user = await this.usersRepository.findOne({ where: { _id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<Users | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });

    return user;
  }

  async update(id: bigint, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: bigint): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  private getAllowedFields(): string[] {
    return this.usersRepository.metadata.columns
      .map((column) => _snakeCase(column.propertyName))
      .concat(['_id']);
  }
}
