import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { EditProfilePage } from './edit-profile';
import { Authentication, Event } from '@12stonechurch/ngkit-mobile';
import { AuthPage } from '../auth/auth';
import { AnalyticsService, NotificationService } from '@12stonechurch/12Stone-angular-mobile';
import { PushService } from '../../services';

@Component({
    selector: 'profile-page',
    templateUrl: './profile.html',
})
export class ProfilePage {
    /**
     * The current user.
     *
     * @type {object}
     */
    user: any = {};

    /**
     * The stringified user to check.
     * 
     * @type {string}
     */
    userCheck: string = '';

    /**
     * Constructor.
     */
    constructor(
        private nav: NavController,
        public auth: Authentication,
        public params: NavParams,
        public analytics: AnalyticsService,
        public pushService: PushService,
        public event: Event,
        public notificationService: NotificationService
    ) { }

    /**
     * On Component init.
     *
     * @return {void}
     */
    ngOnInit(): void { }

    /**
     * After the view init.
     *
     * @return {void}
     */
    ngAfterViewInit(): void {
        this.auth.check().then(() => {
            if (this.params.get('user') && !this.compareCurrentUser(this.params.get('user'))) {
                this.user = this.params.get('user');
                this.userCheck = JSON.stringify(this.user);
            } else {
                if(!this.compareCurrentUser(this.auth.user())){
                    this.user = this.auth.user();
                    this.userCheck = JSON.stringify(this.user);
                }
            }
        }, error => alert(error));
    }

    compareCurrentUser(user: any): boolean{
        let compareUser = JSON.stringify(user);
        return compareUser == this.userCheck;
    }

    /**
     * Go to the edit profile form.
     *
     * @return {void}
     */
    edit(): void {
        this.nav.push(EditProfilePage, {
            user: this.user
        });
    }

    /**
     * Log the user out.
     *
     * @return {void}
     */
    logout(): void {

        //Track logout
        this.analytics.trackEvent('Logout', this.auth.user());

        //Pusher logout
        this.notificationService.unsubscribeFromMessages(this.auth.user().UserId)

        //Clear out of notifications
        this.pushService.unregisterDevice();
        
        //Perform logout
        this.auth.logout();
        this.event.broadcast('user:loggedOut');
        this.event.broadcast('notifications:change');
        
        //Go back to profile
        this.nav.push(AuthPage);
    }
}
