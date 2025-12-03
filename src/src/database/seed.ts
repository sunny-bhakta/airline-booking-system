import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeders/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);

  const command = process.argv[2];

  try {
    switch (command) {
      case 'seed':
        await seeder.seedAll();
        break;
      case 'clear':
        await seeder.clearAll();
        break;
      default:
        console.log('Usage: npm run seed [seed|clear]');
        console.log('  seed  - Seed all data');
        console.log('  clear - Clear all data');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

