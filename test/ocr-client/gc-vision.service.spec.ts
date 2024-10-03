import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GcVisionService } from '@/ocr-client/services/gc-vision.service';
import * as fs from 'node:fs';
import { MediaUtil } from '@/common/utils/media.util';

describe('GcVisionService', () => {
  let service: GcVisionService;
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
        GcVisionService,
        {
          provide: ImageAnnotatorClient,
          useValue: {
            textDetection: jest.fn(),
            documentTextDetection: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GcVisionService>(GcVisionService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectText', () => {
    it('should detect text successfully', async () => {
      const buffer = fs.readFileSync('./test/data/test.png', null);

      const mockFile: Express.Multer.File = {
        fieldname: 'testFile',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        buffer: buffer,
        path: 'test.png',
        destination: '',
        filename: 'test.png',
        stream: null as any, // 실제 스트림 객체가 필요하다면 mock 스트림을 만들어야 합니다
      };

      const mediaUtil = new MediaUtil();

      const filePath = await mediaUtil.saveTempFile(mockFile);

      const result = await service.detectText(filePath);

      console.log(result);
    });

    it('should throw an error when text detection fails', async () => {});
  });

  describe('detectDocumentText', () => {
    it('should detect document text successfully', async () => {});

    it('should throw an error when document text detection fails', async () => {});
  });
});
