import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './instrument';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    app.enableCors({
        origin: true,
        credentials: true,
    });

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(
        `🧩 Widget Registry Service running on http://localhost:${port}`,
    );
    console.log(`🚀 GraphQL Playground: http://localhost:${port}/graphql`);
}
bootstrap();
