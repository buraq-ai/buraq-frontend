import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';        // Correct: importing the class named "App"

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));