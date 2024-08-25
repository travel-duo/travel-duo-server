import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from '@/video/video.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from '@/video/entities/video.entity';
import { Repository } from 'typeorm';
import { StorageClientFactory } from '@/storage-client/storage-client.factory';
import { SttClientFactory } from '@/stt-client/stt-client.factory';
import * as fs from 'node:fs';
import { MediaUtil } from '@/common/utils/media.util';
import { WhisperService } from '@/stt-client/services/whisper.service';
import { GcStorageService } from '@/storage-client/services/gc-storage.service';

describe('VideoService Integration Test', () => {
  let service: VideoService;
  let module: TestingModule;
  let videoSttRepository: Repository<Video>;
  let storageClientFactory: StorageClientFactory;
  let sttClientFactory: SttClientFactory;
  let mediaUtil: MediaUtil;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        VideoService,
        {
          provide: getRepositoryToken(Video),
          useClass: Repository,
        },
        StorageClientFactory,
        SttClientFactory,
        WhisperService,
        GcStorageService,
        MediaUtil,
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    videoSttRepository = module.get<Repository<Video>>(
      getRepositoryToken(Video),
    );
    storageClientFactory =
      module.get<StorageClientFactory>(StorageClientFactory);
    sttClientFactory = module.get<SttClientFactory>(SttClientFactory);
    mediaUtil = module.get<MediaUtil>(MediaUtil);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get Stt', () => {
    it('should return stt using real WhisperService', async () => {
      // 실제 비디오 파일 경로 (테스트용 비디오 파일이 필요합니다)
      const buffer = fs.readFileSync('./test/data/test.mp4', null);
      // const videoFilePath = './test/data/test.mp4';

      const mockFile: Express.Multer.File = {
        fieldname: 'testFile',
        originalname: 'test.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        size: buffer.length,
        buffer: buffer,
        stream: null as any,
      } as Express.Multer.File;

      const videoFilePath = await mediaUtil.saveTempFile(mockFile);

      try {
        // 실제 getStt 메소드 호출
        const result = await service.getStt(videoFilePath);
        // 결과 확인
        expect(result).toBeDefined();
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        await mediaUtil.cleanupTempFile(videoFilePath);
      }
    });
  });

  describe('uploadVideoToStorageAndUpdateStt', () => {
    it('should upload video, create STT, and return updated VideoStt entity', async () => {
      // 실제 비디오 파일 준비
      const buffer = fs.readFileSync('./test/data/test.mp4');
      const mockFile: Express.Multer.File = {
        fieldname: 'testFile',
        originalname: 'test.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        size: buffer.length,
        buffer: buffer,
        stream: null as any,
      } as Express.Multer.File;

      // 실제 메소드 호출
      const result = await service.uploadVideoToStorageAndUpdateStt(
        mockFile,
        {},
      );

      // 결과 확인
      expect(result).toBeDefined();
      expect(result.stt).toBeDefined();

      // 데이터베이스에 저장된 엔티티 확인
      const savedEntity = await videoSttRepository.findOne({
        where: { _id: result._id },
      });
      expect(savedEntity).toBeDefined();
      expect(savedEntity.stt).toEqual(result.stt);
    }, 60000); // 시간 제한을 60초로 설정 (업로드 및 STT 처리에 시간이 걸릴 수 있음)
  });
});
