import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/common/database.module';
import { Classroom } from '@/classroom/entities/classroom.entity';
import { ClassroomStudent } from '@/classroom/entities/classroom-student.entity';
import { ClassroomManager } from '@/classroom/entities/classroom-manager.entity';
import { ClassroomSetting } from '@/classroom/entities/classroom-setting.entity';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([
          User,
          Classroom,
          ClassroomStudent,
          ClassroomManager,
          ClassroomSetting,
        ]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      // Use a pre-existing test user
      const testUserId = 1; // Assume this is the ID of a test user that already exists in the database
      const expectedEmail = 'admin'; // The expected email of the test user

      // Now test finding the user
      const foundUser = await service.findOne(testUserId);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toEqual(expectedEmail);
    });
  });
});
