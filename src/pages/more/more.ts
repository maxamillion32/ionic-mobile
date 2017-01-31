import { Component } from '@angular/core';
import { PrayerRequestPage } from './prayer-request';
import { NavController } from 'ionic-angular';
import { AboutPage } from './about';
import { SuggestionsPage} from './suggestions';
import { NotificationsPage } from './notifications';
import { SettingsPage } from './settings';
import { AnalyticsService, NotificationService, UserService, UserSettingsModel } from '@12stonechurch/12Stone-angular-mobile';
import { Event, Authentication } from '@12stonechurch/ngkit-mobile';
import { PushService } from '../../services/push';

@Component({
    selector: 'more-page',
    templateUrl: './more.html'
})
export class MorePage {

    /**
     * The badge count for the more tab
     * 
     * @type {number}
     */
    badgeCount: number = 0;

    /**
     * Component subscriptions.
     *
     * @type {any}
     */
    subscriptions: any[] = [];

    /**
     * Whether in app notifications are allowed or not
     * 
     * @type{boolean}
     */
    notificationsAllowed: boolean = false;

    /**
     * Whether settings are allowed
     * 
     * @type{boolean}
     * 
     */
    displaySettings: boolean = false;

    /**
     * Constructor.
     *
     * @param  {NavController} nav
     */
    constructor(
        public nav: NavController,
        public analyticsService : AnalyticsService,
        public event : Event,
        public notificationService: NotificationService,
        public auth: Authentication,
        public pushService: PushService,
        public userService: UserService) {

        }

    /**
     * Open a link.
     */
    openLink(link: string): void {
        this.analyticsService.trackPageAction('More', 'Click Link', { link: link });
        window.open(link, '_system');
    }

    /**
     * Go to the Prayer Request form.
     *
     * @return {void}
     */
    navPrayerRequest(): void {
        this.nav.push(PrayerRequestPage);
    }

    /**
     * Go to the about page.
     *
     * @return {void}
     */
    navAboutPage(): void {
        this.nav.push(AboutPage);
    }

    /**
     * Go to the settings page.
     * 
     * @return{void}
     */
    navSettingsPage():void{
        this.nav.push(SettingsPage);
    }
    
    /**
     * Go to the about page.
     *
     * @return {void}
     */
    navSuggestionsPage(): void {
        this.nav.push(SuggestionsPage);
    }

    /**
     * Go to the notifications page.
     * 
     * @returns{void}
     */
    navNotificationsPage(): void{
        this.nav.push(NotificationsPage);
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        this.unsubscribe();
        this.subscriptions = [];
    }

    /**
     * Unsubscribe from subscriptions.
     *
     * @return {void}
     */
    unsubscribe(): void {
        Object.keys(this.subscriptions)
            .forEach(k => this.subscriptions[k].unsubscribe());
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {

        //Initialize all subscriptions
        this.subscriptions['notifications:checkCount'] = this.event.listen('notifications:checkCount')
            .subscribe((res:{settings:UserSettingsModel, count:number}) => {
                if(res.settings){
                    this.notificationsAllowed = res.settings.AllowInAppNotifications;

                    if(this.notificationsAllowed && this.auth.user()){
                        this.badgeCount = res.count;
                    } else{
                        this.badgeCount = 0;
                    }
                } else {
                    this.notificationsAllowed = false;
                    this.badgeCount = 0;
                }
            });

        this.subscriptions['notifications:read'] = this.event.listen('notifications:read')
            .subscribe(() => {
                this.badgeCount = 0;
            });

        this.subscriptions['user:loggedIn'] = this.event.listen('user:loggedIn')
            .subscribe(() =>{
                this.displaySettings = true;
            });
        
        this.subscriptions['user:loggedOut'] = this.event.listen('user:loggedOut')
            .subscribe(() =>{
                this.displaySettings = false;
                this.badgeCount = 0;
                this.notificationsAllowed = false;
            });

        if(this.auth.user()){
            this.displaySettings = true;
            this.userService.getSettings().then((settings: UserSettingsModel) =>{
                this.notificationService.getBadgeCount().then((count) =>{
                    this.event.broadcast('notifications:checkCount', {settings, count});
                });
            });
        }
    }    
}
