import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiIntegrationService } from './ai-integration.service';
import { AiIntegrationController } from './ai-integration.controller';

@Module({
  imports: [HttpModule],
  controllers: [AiIntegrationController],
  providers: [AiIntegrationService],
  exports: [AiIntegrationService],
})
export class AiIntegrationModule { }