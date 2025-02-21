import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Import your routes
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide your routes
    provideHttpClient(),  //Provide HTTP Client
    importProvidersFrom(BrowserAnimationsModule)
  ]
}).catch(err => console.error(err));
