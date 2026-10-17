import { Controller, Post, Body } from '@nestjs/common';
import { AiIntegrationService } from './ai-integration.service';

@Controller('ai')
export class AiIntegrationController {
  constructor(private readonly aiService: AiIntegrationService) {}

  @Post('chat')
  async chat(@Body('question') question: string) {
    return this.aiService.chat(question || '');
  }
}
