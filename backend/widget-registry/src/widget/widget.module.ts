import { Module } from '@nestjs/common';
import { WidgetResolver } from './widget.resolver';
import { WidgetService } from './widget.service';

@Module({
    providers: [WidgetResolver, WidgetService],
    exports: [WidgetService],
})
export class WidgetModule {}
