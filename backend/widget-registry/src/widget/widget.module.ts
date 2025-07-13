import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { WidgetResolver } from './widget.resolver';
import { WidgetService } from './widget.service';

@Module({
    imports: [EventsModule],
    providers: [WidgetResolver, WidgetService, PrismaService, LoggerService],
    exports: [WidgetService],
})
export class WidgetModule {}
