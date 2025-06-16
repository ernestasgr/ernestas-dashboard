import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WidgetResolver } from './widget.resolver';
import { WidgetService } from './widget.service';

@Module({
    providers: [WidgetResolver, WidgetService, PrismaService],
    exports: [WidgetService],
})
export class WidgetModule {}
