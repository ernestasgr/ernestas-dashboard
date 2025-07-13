import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { EventPublisherService } from './event-publisher.service';

@Module({
    imports: [LoggerModule],
    providers: [EventPublisherService],
    exports: [EventPublisherService],
})
export class EventsModule {}
