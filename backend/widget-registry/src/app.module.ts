import {
    ApolloFederationDriver,
    ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { WidgetModule } from './widget/widget.module';

@Module({
    imports: [
        SentryModule.forRoot(),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            autoSchemaFile: {
                path: join(process.cwd(), 'src/schema.gql'),
                federation: 2,
            },
            introspection: true,
            playground: true,
            sortSchema: true,
        }),
        WidgetModule,
        LoggerModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
        },
        AppService,
    ],
})
export class AppModule {}
