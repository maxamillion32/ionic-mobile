import { Component } from '@angular/core';
import { FeedPage } from '../feed/feed';
import { MyGroupsPage } from '../groups/my-groups';
import { MorePage } from '../more/more';
import { AuthPage } from '../auth/auth';
import { Authentication, Event } from '@12stonechurch/ngkit-mobile';
import { NavController } from 'ionic-angular';
import { PushService } from '../../services/push';
import { NotificationService, UserService, UserSettingsModel, GroupMessageService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'tabs-page',
    templateUrl: './tabs.html',
})
export class TabsPage {
    /**
     * The Feed component.
     *
     * @type {FeedPage}
     */
    tab1Root: any = FeedPage;

    /**
     * The My Groups Component.
     *
     * @type {MyGroupsPage}
     */
    tab2Root = MyGroupsPage;

    /**
     * The profile or AuthPage
     *
     * @return {ProfileComponent}
     */
    tab3Root = AuthPage;

    /**
     * The more component.
     *
     * @type {MoreComponent}
     */
    tab4Root = MorePage;

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
     * Whether or not push is allowed.
     * 
     * @type{boolean}
     */
    notificationsAllowed : boolean = false;

    /**
     * Constructor.
     *
     * @param  {Authentication} auth
     */
    constructor(
        public nav: NavController,
        public auth: Authentication,
        public event: Event,
        public pushService: PushService,
        public notificationService: NotificationService,
        public userService: UserService,
        public groupmessage: GroupMessageService
    ) {}

     /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        
        //Initialize all subscriptions

        this.subscriptions['notificationsChange'] = this.event.listen('notifications:change')
            .subscribe(() =>{
                if(this.auth.user()){
                    this.userService.getSettings().then((settings:UserSettingsModel) =>{
                        this.notificationService.getBadgeCount().then((count) =>{
                            this.event.broadcast('notifications:checkCount', {settings, count})
                        });
                    });
                } else{
                    this.event.broadcast('notifications:checkCount', {settings: null, count: 0})
                }
            });
        
        this.subscriptions['notificationsCheckCount'] = this.event.listen('notifications:checkCount')
            .subscribe((res:{settings:UserSettingsModel, count:number}) => {
                
                if(res.count <= 0) {
                    this.pushService.clearBadge();
                } else {
                    this.pushService.setBadge(res.count);
                }
                
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

        this.subscriptions['notificationsRead'] = this.event.listen('notifications:read')
            .subscribe(() => {
                this.badgeCount = 0;
            });
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
}
