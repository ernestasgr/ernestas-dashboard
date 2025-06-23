import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark endpoints as public, bypassing gateway authentication.
 *
 * Use this decorator on controllers or individual route handlers that should
 * be accessible without the gateway secret header (e.g., health checks).
 */
export const Public = () => SetMetadata('isPublic', true);
