import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import config from 'devextreme/core/config'; // https://js.devexpress.com/Angular/Documentation/Guide/Angular_Components/Getting_Started/Add_DevExtreme_to_an_Angular_CLI_Application/
import { devextremeLicense } from './devextreme-license';

config({
    licenseKey: devextremeLicense
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));