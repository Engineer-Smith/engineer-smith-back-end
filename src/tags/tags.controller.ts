// src/tags/tags.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * GET /tags
   * Get all unique tags, optionally filtered by language
   */
  @Get()
  async getTags(
    @Query('languages') languages?: string,
    @Query('type') type?: string,
  ) {
    // languages can be comma-separated: "javascript,python"
    const languageList = languages?.split(',').map(l => l.trim()).filter(Boolean);
    return this.tagsService.getTags({ languages: languageList, type });
  }
}
