import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Guard that validates the gateway secret header for incoming requests.
 *
 * Requests must include a valid 'x-gateway-secret' header to be processed,
 * except for endpoints marked with the @Public() decorator.
 */
@Injectable()
export class GatewayAuthGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    /**
     * Validates that the request contains the correct gateway secret header.
     *
     * @param context - The execution context containing request information
     * @returns true if the request is authorized, throws ForbiddenException otherwise
     * @throws ForbiddenException when the gateway secret is missing or invalid
     */
    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = this.getRequest(context);
        const gatewaySecret = this.configService.get<string>('GATEWAY_SECRET');
        const requestSecret = request.headers['x-gateway-secret'];

        if (!gatewaySecret || requestSecret !== gatewaySecret) {
            throw new ForbiddenException('Invalid or missing gateway secret');
        }

        return true;
    }

    /**
     * Extracts the request object from either HTTP or GraphQL context.
     *
     * @param context - The execution context
     * @returns the request object
     */
    private getRequest(context: ExecutionContext) {
        const contextType = context.getType();

        if (contextType === 'http') {
            return context.switchToHttp().getRequest();
        }

        const gqlContext = GqlExecutionContext.create(context);
        return gqlContext.getContext().req;
    }
}
