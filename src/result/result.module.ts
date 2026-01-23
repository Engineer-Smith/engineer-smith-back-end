// src/result/result.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultController } from './result.controller';
import { ResultService } from './services/result.service';
import { ResultValidationService } from './services/result-validation.service';
import { ResultFormatterService } from './services/result-formatter.service';
import { Result, ResultSchema } from '../schemas/result.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';
import { OrganizationGuard } from '../auth/guards/organization.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [ResultController],
  providers: [
    ResultService,
    ResultValidationService,
    ResultFormatterService,
    OrganizationGuard,
  ],
  exports: [ResultService, ResultFormatterService],
})
export class ResultModule {}