import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { httpInterceptorProviders } from './app/interceptors';

bootstrapApplication(App, {
  ...appConfig,
  providers: [...(appConfig.providers || []), ...httpInterceptorProviders],
}).catch((err) => console.error(err));
