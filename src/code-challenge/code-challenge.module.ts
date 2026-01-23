// src/code-challenge/code-challenge.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeChallengeController } from './code-challenge.controller';
import { CodeChallengeAdminController } from './code-challenge-admin.controller';
import { CodeChallengeService } from './code-challenge.service';
import { CodeChallengeAdminService } from './code-challenge-admin.service';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { CodeChallenge, CodeChallengeSchema } from '../schemas/code-challenge.schema';
import { Track, TrackSchema } from '../schemas/track.schema';
import { ChallengeSubmission, ChallengeSubmissionSchema } from '../schemas/challenge-submission.schema';
import { UserChallengeProgress, UserChallengeProgressSchema } from '../schemas/user-challenge-progress.schema';
import { UserTrackProgress, UserTrackProgressSchema } from '../schemas/user-track-progress.schema';
import { Organization, OrganizationSchema } from '../schemas/organization.schema';
import { GradingModule } from '../grading/grading.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CodeChallenge.name, schema: CodeChallengeSchema },
      { name: Track.name, schema: TrackSchema },
      { name: ChallengeSubmission.name, schema: ChallengeSubmissionSchema },
      { name: UserChallengeProgress.name, schema: UserChallengeProgressSchema },
      { name: UserTrackProgress.name, schema: UserTrackProgressSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    GradingModule,
  ],
  controllers: [CodeChallengeController, CodeChallengeAdminController],
  providers: [CodeChallengeService, CodeChallengeAdminService, OrganizationGuard],
  exports: [CodeChallengeService, CodeChallengeAdminService],
})
export class CodeChallengeModule {}