// src/code-challenge/code-challenge.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CodeChallengeService } from './code-challenge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  GetChallengesQueryDto,
  GetTracksQueryDto,
  RunCodeDto,
} from './dto/code-challenge.dto';

@Controller('code-challenges')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class CodeChallengeController {
  constructor(private readonly codeChallengeService: CodeChallengeService) {}

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  /**
   * GET /code-challenges/tracks
   * Browse all tracks
   * Access: Public
   */
  @Get('tracks')
  @Public()
  async getTracks(@Query() filters: GetTracksQueryDto) {
    return this.codeChallengeService.getTracks(filters);
  }

  /**
   * GET /code-challenges/tracks/:language/:trackSlug
   * Get specific track with challenges
   * Access: Public (with optional auth for progress)
   */
  @Get('tracks/:language/:trackSlug')
  @Public()
  async getTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.codeChallengeService.getTrack(language, trackSlug, user);
  }

  /**
   * GET /code-challenges/challenges
   * Browse all challenges
   * Access: Public (with optional auth for progress)
   */
  @Get('challenges')
  @Public()
  async getChallenges(
    @Query() filters: GetChallengesQueryDto,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.codeChallengeService.getChallenges(filters, user);
  }

  /**
   * GET /code-challenges/challenges/:challengeId
   * Get specific challenge
   * Access: Public (with optional auth for progress)
   */
  @Get('challenges/:challengeId')
  @Public()
  async getChallenge(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.codeChallengeService.getChallenge(challengeId, user);
  }

  // ==========================================
  // AUTHENTICATED USER ROUTES
  // ==========================================

  /**
   * GET /code-challenges/dashboard
   * Get user's dashboard/stats
   * Access: Authenticated
   */
  @Get('dashboard')
  async getUserDashboard(@CurrentUser() user: RequestUser) {
    return this.codeChallengeService.getUserDashboard(user);
  }

  /**
   * POST /code-challenges/challenges/:challengeId/test
   * Test code against sample test cases
   * Access: Authenticated
   */
  @Post('challenges/:challengeId/test')
  @HttpCode(HttpStatus.OK)
  async testChallenge(
    @Param('challengeId') challengeId: string,
    @Body() dto: RunCodeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.testChallenge(challengeId, dto, user);
  }

  /**
   * POST /code-challenges/challenges/:challengeId/submit
   * Submit solution to challenge
   * Access: Authenticated
   */
  @Post('challenges/:challengeId/submit')
  @HttpCode(HttpStatus.OK)
  async submitChallenge(
    @Param('challengeId') challengeId: string,
    @Body() dto: RunCodeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.submitChallenge(challengeId, dto, user);
  }

  /**
   * POST /code-challenges/tracks/:language/:trackSlug/enroll
   * Enroll in a track
   * Access: Authenticated
   */
  @Post('tracks/:language/:trackSlug/enroll')
  @HttpCode(HttpStatus.OK)
  async enrollInTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.enrollInTrack(language, trackSlug, user);
  }

  /**
   * GET /code-challenges/tracks/:language/:trackSlug/progress
   * Get user's track progress
   * Access: Authenticated
   */
  @Get('tracks/:language/:trackSlug/progress')
  async getUserTrackProgress(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.getUserTrackProgress(language, trackSlug, user);
  }
}