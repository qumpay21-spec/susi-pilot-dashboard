import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // Comma-separated list of allowed frontend origins, e.g. "https://my-app.vercel.app".
  // Leave unset to allow any origin.
  const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : true });

  // When the frontend has been built (`nuxt generate`), serve it from the same server,
  // so the whole app runs as one service on one URL.
  const webDir = resolve(process.env.WEB_DIR ?? join(process.cwd(), '..', 'frontend', '.output', 'public'));
  if (existsSync(join(webDir, 'index.html'))) {
    app.useStaticAssets(webDir);
    console.log(`Serving frontend from ${webDir}`);
  }

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`API ready on http://localhost:${port}/api`);
}
bootstrap();
