// import { Injectable } from '@nestjs/common';
// import {
//   GptClientFactory,
//   GptServiceType,
// } from '@/gpt-client/gpt-client.factory';
//
// @Injectable()
// export class ChatbotService {
//   constructor(private gptClientFactory: GptClientFactory) {}
//
//   async generateResponse(
//     videoId: number,
//     userMessage: string,
//   ): Promise<string> {
//     const videoStt = await this.videoRepository.findOne({
//       where: { _id: videoId },
//     });
//
//     if (!videoStt || !videoStt.sttOriginal) {
//       throw new Error('VideoStt not found or sttOriginal is missing');
//     }
//
//     const systemMessage =
//       '너는 QnA 쳇봇이야. 수업내용을 바탕으로 사용자에게 답변해줘. ' +
//       `수업내용: ${videoStt.sttOriginal.text}`;
//     const gptClient = this.gptClientFactory.getClient(
//       GptServiceType.GPT_4O_MINI,
//     );
//
//     const options = {
//       messages: [
//         { role: 'system', content: systemMessage },
//         { role: 'user', content: userMessage },
//       ],
//       max_tokens: 1000, // Adjust as needed
//     };
//
//     const response = await gptClient.generateResponse(options);
//     return response.choices[0].message.content;
//   }
//
//   async generateStreamResponseByVideoId(
//     videoId: number,
//     userMessage: string,
//   ): Promise<any> {
//     const video = await this.videoRepository.findOne({
//       where: { _id: videoId },
//     });
//
//     if (!video || !video.sttOriginal) {
//       throw new Error('Video not found or sttOriginal is missing');
//     }
//
//     const systemMessage = video.sttOriginal.text;
//     const gptClient = this.gptClientFactory.getClient(
//       GptServiceType.GPT_4O_MINI,
//     );
//
//     const options = {
//       messages: [
//         {
//           role: 'system',
//           content:
//             systemMessage +
//             '\n위 내용은 강의 내용이야. 이것을 바탕으로 쳇봇형식으로 답변하면돼.',
//         },
//         { role: 'user', content: userMessage },
//       ],
//       max_tokens: 1000,
//     };
//
//     return gptClient.generateStreamResponse(options);
//   }
// }
