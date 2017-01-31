import { StatusBar, Splashscreen, Device } from 'ionic-native';
import { ngKit, Authentication, Event } from '@12stonechurch/ngkit-mobile';
import { Component } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { TabsPage } from '../pages/tabs/tabs';
import { ConfigService, AnalyticsService, UserService, NotificationService } from '@12stonechurch/12Stone-angular-mobile';
import { PushService } from '../services/push';

@Component({
    templateUrl: './app.component.html'
})
export class MyApp {
    /**
     * Root page of app.
     *
     * @type {any}
     */
    rootPage: any = TabsPage;

    /**
     * Constructor.
     *
     * @param  {Platform} platform
     * @param  {Authentication} auth
     */
    constructor(
        public platform: Platform,
        public ngkit: ngKit,
        public auth: Authentication,
        public config: ConfigService,
        public analytics: AnalyticsService,
        public app: App,
        public pushService: PushService,
        public event: Event,
        public userService: UserService,
        public notificationsService: NotificationService
    ) {
        this.platform.ready().then(() => {

            //register pause and resume
            platform.pause.subscribe(() => {
                this.analytics.trackEvent("Application Paused");
            });

            platform.resume.subscribe(() => {
                this.analytics.trackEvent("Application Resumed");

                if(this.auth.user()){
                    this.pushService.registerDevice();
                    this.event.broadcast('notifications:change');
                }
            });

            //analytics stuff
            this.analytics.init(Device.uuid);
            this.analytics.trackEvent("Application Opened");

            //authentication stuff
            this.auth.check().then(
                (loggedIn: boolean) => {
                    this.userAnalytics();
                    this.registerNotifications();
            }, error =>{});

            //status bar stuff
            if(platform.is('ios')){
                StatusBar.styleDefault();
            }

            if(platform.is('android')){
                StatusBar.backgroundColorByHexString("#174E5F");
                window["plugins"].headerColor.tint("#174E5F");
            }

            //hide the Splashscreen
            this.hideSplashScreen();
        });
    }

    /**
     * Initialize push registration
     */
    registerNotifications():void{
        this.pushService.registerDevice();
        this.notificationsService.subscribeToMessages(this.auth.user().UserId);
        this.event.broadcast('user:loggedIn');
        this.event.broadcast('notifications:change');
    }

    /**
     * Initialize analytics tracking for the user.
     */
    userAnalytics(): void {
        if (this.auth.user()) {
            this.analytics
                .profile({
                    '$first_name': this.auth.user().Nickname,
                    '$last_name': this.auth.user().LastName,
                    '$email': this.auth.user().EmailAddress
                });
            this.analytics.identify(this.auth.user().UserId);
            this.analytics.trackEvent('Return Visit', this.auth.user());
        }
    }

    hideSplashScreen() {
        if (Splashscreen) {
            setTimeout(() => {
                Splashscreen.hide();
            }, 100);
        }   
    }
}
