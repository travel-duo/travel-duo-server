import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { MediaUtil } from '@/common/utils/media.util';
import { GcStorageService } from '@/storage-client/services/gc-storage.service';
import * as fs from 'node:fs';

describe('GCSStorageService', () => {
  let service: GcStorageService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        GcStorageService,
        {
          provide: Storage,
          useValue: {
            bucket: jest.fn().mockReturnValue({
              upload: jest.fn(),
              file: jest.fn(),
            }),
          },
        },
        {
          provide: MediaUtil,
          useValue: {
            saveTempFile: jest.fn(),
            cleanupTempFile: jest.fn(),
            createReadStream: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GcStorageService>(GcStorageService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      //'../data/test.pdf'

      const buffer = fs.readFileSync('./test/data/test.pdf', null);

      const mockFile: Express.Multer.File = {
        fieldname: 'testFile',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 12345,
        destination: '/tmp/uploads/',
        filename: 'test-1234567890.pdf',
        path: '/tmp/uploads/test-1234567890.pdf',
        buffer: buffer,
        stream: null as any, // 실제 스트림 객체가 필요하다면 mock 스트림을 만들어야 합니다
      };

      const mediaUtil = new MediaUtil();

      const filePath = await mediaUtil.saveTempFile(mockFile);

      const result = await service.streamUploadFile(
        'test-destination',
        filePath,
      );
    });
  });

  describe('streamUploadFile', () => {
    it('should stream upload a file successfully', async () => {});
  });

  describe('getFile', () => {
    it('should get a file successfully', async () => {});
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {});
  });
});
