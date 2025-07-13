import {
    ApolloFederationDriver,
    ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { GatewayAuthGuard } from './guards/gateway-auth.guard';
import { LoggerModule } from './logger/logger.module';
import { WidgetModule } from './widget/widget.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        SentryModule.forRoot(),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            autoSchemaFile: {
                path: join(process.cwd(), 'src/schema.gql'),
                federation: 2,
            },
            introspection: process.env.NODE_ENV !== 'production',
            playground: process.env.NODE_ENV !== 'production',
            sortSchema: true,
        }),
        WidgetModule,
        LoggerModule,
        EventsModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
        },
        {
            provide: APP_GUARD,
            useClass: GatewayAuthGuard,
        },
        AppService,
    ],
})
export class AppModule {}
