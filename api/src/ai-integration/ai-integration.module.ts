import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiIntegrationService } from './ai-integration.service';
import { AiService } from './ai.service';
import { AiIntegrationController } from './ai-integration.controller';

@Module({
  imports: [HttpModule],
  controllers: [AiIntegrationController],
  providers: [AiIntegrationService, AiService],
  exports: [AiIntegrationService, AiService],
})
export class AiIntegrationModule { }