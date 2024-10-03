// import {
//   Body,
//   Controller,
//   NotFoundException,
//   Param,
//   ParseIntPipe,
//   Post,
//   Sse,
//   UseGuards,
// } from '@nestjs/common';
// import { ChatbotService } from './chatbot.service';
// import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { AdminTeacherGuard } from '@/auth/guards/admin-teacher.guard';
// import { StreamChatDto } from '@/chatbot/dto/stream-chat.dto';
// import { Observable } from 'rxjs';
//
// @Controller({
//   path: 'chatbot',
//   version: '1',
// })
// @ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard)
// @ApiTags('chatbot')
// export class ChatbotController {
//   constructor(private readonly chatbotService: ChatbotService) {}
//
//   @Post('videos/:videoId')
//   @Sse()
//   @UseGuards(AdminTeacherGuard)
//   @ApiOperation({
//     summary:
//       'Video Stt 정보를 바탕으로 챗봇 응답을 스트리밍 방식으로 생성합니다.',
//   })
//   async streamVideoResponse(
//     @Param('videoId', ParseIntPipe) videoId: number,
//     @Body() streamChatDto: StreamChatDto,
//   ): Promise<Observable<MessageEvent>> {
//     return new Observable((observer: any) => {
//       (async () => {
//         try {
//           const stream =
//             await this.chatbotService.generateStreamResponseByVideoId(
//               videoId,
//               streamChatDto.message,
//             );
//
//           for await (const chunk of stream) {
//             observer.next({ data: chunk });
//           }
//
//           observer.complete();
//         } catch (error) {
//           if (error.message === 'Video not found or sttOriginal is missing') {
//             observer.error(
//               new NotFoundException(
//                 `Video with ID "${videoId}" not found or has no STT data`,
//               ),
//             );
//           } else {
//             observer.error(error);
//           }
//         }
//       })();
//     });
//   }
//
//   // @Get('history/:videoSttId')
//   // @UseGuards(AdminTeacherGuard)
//   // @ApiOperation({ summary: '특정 Video STT ID에 대한 채팅 기록을 조회합니다.' })
//   // @ApiResponse({
//   //   status: 200,
//   //   description: '채팅 기록이 성공적으로 조회되었습니다.',
//   // })
//   // async getChatHistory(
//   //   @Param('videoSttId', ParseIntPipe) videoSttId: number,
//   // ): Promise<any> {
//   //   // 이 메서드는 ChatbotService에 추가해야 합니다.
//   //   return this.chatbotService.getChatHistory(videoSttId);
//   // }
// }
