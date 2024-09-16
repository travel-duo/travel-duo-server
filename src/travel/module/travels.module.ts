import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelsController } from '@/travel/controller/travels.controller';
import { TravelsService } from '@/travel/service/travels.service';
import { UserService } from '@/user/user.service';
import { Users } from '@/user/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Travels, Users])],
  controllers: [TravelsController],
  providers: [TravelsService, UserService],
  exports: [TravelsService],
})
export class TravelsModule {}
