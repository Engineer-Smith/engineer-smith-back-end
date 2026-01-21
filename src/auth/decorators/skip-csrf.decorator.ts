import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * Decorator to skip CSRF protection for a route
 * Usage: @SkipCsrf()
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
