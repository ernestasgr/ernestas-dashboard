import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Public()
    @Get('health')
    healthCheck(): { status: string; service: string } {
        return {
            status: 'ok',
            service: 'widget-registry',
        };
    }

    @Public()
    @Get('debug-sentry')
    getError() {
        throw new Error('My first Sentry error!');
    }
}
