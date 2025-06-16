import {
    ApolloFederationDriver,
    ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WidgetModule } from './widget/widget.module';

@Module({
    imports: [
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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
