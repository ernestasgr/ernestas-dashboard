import { Module } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { WidgetResolver } from './widget.resolver';
import { WidgetService } from './widget.service';

@Module({
    providers: [WidgetResolver, WidgetService, PrismaService, LoggerService],
    exports: [WidgetService],
})
export class WidgetModule {}
