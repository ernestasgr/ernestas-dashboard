import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { LoggerService } from '../logger/logger.service';

export interface WidgetDeletedEvent {
    widgetId: string;
    widgetType: string;
    userId: string;
    timestamp: string;
}

@Injectable()
export class EventPublisherService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private producer: Producer;

    constructor(private readonly logger: LoggerService) {
        this.kafka = new Kafka({
            clientId: 'widget-registry',
            brokers: [process.env.KAFKA_BROKERS || 'event-bus:9092'],
        });
        this.producer = this.kafka.producer();
    }

    async onModuleInit() {
        try {
            await this.producer.connect();
            this.logger.log('Kafka producer connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect Kafka producer', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.producer.disconnect();
            this.logger.log('Kafka producer disconnected successfully');
        } catch (error) {
            this.logger.error('Failed to disconnect Kafka producer', error);
        }
    }

    async publishWidgetDeleted(event: WidgetDeletedEvent): Promise<void> {
        try {
            await this.producer.send({
                topic: 'widget-deleted',
                messages: [
                    {
                        key: event.widgetId,
                        value: JSON.stringify(event),
                        headers: {
                            eventType: 'widget-deleted',
                            version: '1.0',
                        },
                    },
                ],
            });

            this.logger.log(
                `Widget deletion event published for widget ${event.widgetId} of type ${event.widgetType}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish widget deletion event for widget ${event.widgetId}`,
                error,
            );
            throw error;
        }
    }
}
