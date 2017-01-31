import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, LoadingController, Loading, ViewController } from 'ionic-angular';
import { SocialAuthentication, PushService } from '../../services';
import { Component } from '@angular/core';
import { Authentication } from '@12stonechurch/ngkit-mobile'
import { AnalyticsService, NotificationService } from '@12stonechurch/12Stone-angular-mobile';
import { Event } from '@12stonechurch/ngkit-mobile';
import { ProfilePage } from '../../pages/profile/profile';

@Component({
    selector: 'login-form',
    templateUrl: './login-form.html',
})
export class LoginForm {
    /**
     * Form model.
     */
    form: FormGroup;

    /**
     * Form errors.
     */
    errors: any = '';

    /**
     * Loading component.
     *
     * @type {LoadingController}
     */
    loader: Loading;

    /**
     * The loadging state of the component.
     *
     * @type {boolean}
     */
    loading: boolean = false;

    /**
     * Constructor.
     *
     * @param  {NavController} nav
     * @param  {LoadingController} loading
     * @param  {Authentication} auth
     * @param  {FormBuilder} formbuilder
     */
    constructor(
        public nav: NavController,
        public loadingCtrl: LoadingController,
        private socialAuth: SocialAuthentication,
        public view: ViewController,
        public auth: Authentication,
        public analytics: AnalyticsService,
        public notificationsService: NotificationService,
        public pushService: PushService,
        public event: Event
    ) {
        this.form = new FormGroup({
            userName: new FormControl('', Validators.required),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)])
        });
    }

    /**
     * Login to app.
     *
     * @return {void}
     */
    submit(isModal) {
        this.presentLoader();

        this.auth.login(this.form.value).then((res) => {
            this.onSubmit().then(() =>{
                this.loader.dismiss();

                if (isModal) {
                    if (this.nav.parent) {
                        this.nav.parent.getActive().dismiss();
                    } else {
                        this.view.dismiss();
                    }
                } else{
                    this.nav.push(ProfilePage);
                }
            })

        }, (error) => {
            this.loader.dismiss();
            this.errors = "Email and/or Password Incorrect!"
        });
    }

    /**
     * Action to take on submit.
     */
    onSubmit(): Promise<any> {

        return new Promise((resolve)=>{
            if (this.auth.user()) {
                this.pushService.registerDevice();
                this.notificationsService.subscribeToMessages(this.auth.user().UserId);
                
                this.analytics
                    .identify(this.auth.user().UserId)
                    .profile({
                        '$first_name': this.auth.user().Nickname,
                        '$last_name': this.auth.user().LastName,
                        '$email': this.auth.user().EmailAddress
                    });
                
                this.event.broadcast('user:loggedIn');
                this.event.broadcast('notifications:change');
                this.analytics.trackEvent('Login', this.auth.user());
                resolve();
            }else{
                resolve();
            }
        });
    }

    /**
     * Present the loader.
     */
    presentLoader() {
        this.loader = this.loadingCtrl.create();
        this.loader.present();
    }
}
