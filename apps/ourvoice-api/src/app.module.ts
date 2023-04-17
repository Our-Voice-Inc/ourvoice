import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRoot({
      connectionURI: `${process.env.SUPERTOKENS_URI}`,
      apiKey: `${process.env.SUPERTOKENS_API_KEY}`,
      appInfo: {
        // Learn more about this on https://supertokens.com/docs/emailpassword/appinfo
        appName: `${process.env.SUPERTOKENS_APP_NAME}` || 'Ourvoice API',
        apiDomain:
          `${process.env.SUPERTOKENS_API_DOMAIN}` || 'http://localhost:3001',
        apiBasePath: `${process.env.SUPERTOKENS_API_BASE_PATH}` || '/auth',
        websiteDomain:
          `${process.env.SUPERTOKENS_WEBSITE_DOMAIN}` ||
          'http://localhost:3030',
        websiteBasePath: `${process.env.SUPERTOKENS_WEBSITE_BASE_PATH}` || '/',
      },
      smtpSettings: {
        host: `${process.env.SMTP_HOST}`,
        port: Number(process.env.SMTP_PORT),
        user: `${process.env.SMTP_USER}`,
        password: `${process.env.SMTP_PASSWORD}`,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}