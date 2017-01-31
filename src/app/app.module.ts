import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AppPages, AppPagesModule } from '../pages';
import { ngKitModule } from '@12stonechurch/ngkit-mobile';
import { ionicAppConfig, ngkitConfig, twelveStoneAngularConfig, ionicCloudSettings } from './config';
import { AppProviders } from '../services';
import { AppComponentsModule } from '../components/index';
import { TwelveStoneModule } from '@12stonechurch/12Stone-angular-mobile';
import { CloudModule } from '@ionic/cloud-angular';

@NgModule({
    declarations: [
        MyApp,
    ],
    imports: [
        IonicModule.forRoot(MyApp, ionicAppConfig),
        CloudModule.forRoot(ionicCloudSettings),
        ngKitModule.forRoot(ngkitConfig),
        TwelveStoneModule.forRoot(twelveStoneAngularConfig),
        AppComponentsModule,
        AppPagesModule,
    ],
    bootstrap: [
        IonicApp
    ],
    entryComponents: [
        MyApp,
        ...AppPages
    ],
    providers: [
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        ...AppProviders
    ]
})
export class AppModule {}

