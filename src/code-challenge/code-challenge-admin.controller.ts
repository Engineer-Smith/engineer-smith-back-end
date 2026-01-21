// src/code-challenge/code-challenge-admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CodeChallengeAdminService } from './code-challenge-admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSuperOrg } from '../auth/decorators/super-org.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  CreateTrackDto,
  UpdateTrackDto,
  AddChallengeToTrackDto,
  AdminChallengesQueryDto,
  GetTracksQueryDto,
  RunCodeDto,
} from './dto/code-challenge.dto';

@Controller('code-challenges/admin')
@RequireSuperOrg()
export class CodeChallengeAdminController {
  constructor(private readonly adminService: CodeChallengeAdminService) {}

  // ==========================================
  // CHALLENGE MANAGEMENT
  // ==========================================

  /**
   * POST /code-challenges/admin/challenges
   * Create new challenge
   */
  @Post('challenges')
  @HttpCode(HttpStatus.CREATED)
  async createChallenge(
    @Body() dto: CreateChallengeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.createChallenge(dto, user);
  }

  /**
   * GET /code-challenges/admin/challenges
   * Get all challenges with full details
   */
  @Get('challenges')
  async getAllChallenges(@Query() filters: AdminChallengesQueryDto) {
    return this.adminService.getAllChallenges(filters);
  }

  /**
   * GET /code-challenges/admin/challenges/:challengeSlug
   * Get single challenge with full details
   */
  @Get('challenges/:challengeSlug')
  async getChallengeById(@Param('challengeSlug') challengeSlug: string) {
    return this.adminService.getChallengeById(challengeSlug);
  }

  /**
   * PUT /code-challenges/admin/challenges/:challengeSlug
   * Update existing challenge
   */
  @Put('challenges/:challengeSlug')
  async updateChallenge(
    @Param('challengeSlug') challengeSlug: string,
    @Body() dto: UpdateChallengeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateChallenge(challengeSlug, dto, user);
  }

  /**
   * DELETE /code-challenges/admin/challenges/:challengeSlug
   * Archive challenge
   */
  @Delete('challenges/:challengeSlug')
  @HttpCode(HttpStatus.OK)
  async deleteChallenge(@Param('challengeSlug') challengeSlug: string) {
    return this.adminService.deleteChallenge(challengeSlug);
  }

  /**
   * POST /code-challenges/admin/challenges/:challengeSlug/test
   * Test challenge with solution code
   */
  @Post('challenges/:challengeSlug/test')
  @HttpCode(HttpStatus.OK)
  async testChallenge(
    @Param('challengeSlug') challengeSlug: string,
    @Body() dto: RunCodeDto,
  ) {
    return this.adminService.testChallenge(challengeSlug, dto);
  }

  // ==========================================
  // TRACK MANAGEMENT
  // ==========================================

  /**
   * POST /code-challenges/admin/tracks
   * Create new track
   */
  @Post('tracks')
  @HttpCode(HttpStatus.CREATED)
  async createTrack(
    @Body() dto: CreateTrackDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.createTrack(dto, user);
  }

  /**
   * GET /code-challenges/admin/tracks
   * Get all tracks with full details
   */
  @Get('tracks')
  async getAllTracks(@Query() filters: GetTracksQueryDto) {
    return this.adminService.getAllTracks(filters);
  }

  /**
   * GET /code-challenges/admin/tracks/:language/:trackSlug
   * Get single track with full details
   */
  @Get('tracks/:language/:trackSlug')
  async getTrackById(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
  ) {
    return this.adminService.getTrackById(language, trackSlug);
  }

  /**
   * PUT /code-challenges/admin/tracks/:language/:trackSlug
   * Update existing track
   */
  @Put('tracks/:language/:trackSlug')
  async updateTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.adminService.updateTrack(language, trackSlug, dto);
  }

  /**
   * DELETE /code-challenges/admin/tracks/:language/:trackSlug
   * Archive track
   */
  @Delete('tracks/:language/:trackSlug')
  @HttpCode(HttpStatus.OK)
  async deleteTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
  ) {
    return this.adminService.deleteTrack(language, trackSlug);
  }

  /**
   * POST /code-challenges/admin/tracks/:language/:trackSlug/challenges
   * Add challenge to track
   */
  @Post('tracks/:language/:trackSlug/challenges')
  @HttpCode(HttpStatus.OK)
  async addChallengeToTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @Body() dto: AddChallengeToTrackDto,
  ) {
    return this.adminService.addChallengeToTrack(language, trackSlug, dto);
  }

  /**
   * DELETE /code-challenges/admin/tracks/:language/:trackSlug/challenges/:challengeId
   * Remove challenge from track
   */
  @Delete('tracks/:language/:trackSlug/challenges/:challengeId')
  @HttpCode(HttpStatus.OK)
  async removeChallengeFromTrack(
    @Param('language') language: string,
    @Param('trackSlug') trackSlug: string,
    @Param('challengeId') challengeId: string,
  ) {
    return this.adminService.removeChallengeFromTrack(language, trackSlug, challengeId);
  }

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================

  /**
   * GET /code-challenges/admin/dashboard/tracks
   * Get tracks overview for dashboard
   */
  @Get('dashboard/tracks')
  async getTracksOverview(@Query('language') language?: string) {
    return this.adminService.getTracksOverview(language);
  }

  /**
   * GET /code-challenges/admin/dashboard/challenges
   * Get challenges overview for dashboard
   */
  @Get('dashboard/challenges')
  async getChallengesOverview(
    @Query('difficulty') difficulty?: string,
    @Query('language') language?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getChallengesOverview({ difficulty, language, status });
  }

  /**
   * GET /code-challenges/admin/analytics
   * Get platform analytics
   */
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }
}