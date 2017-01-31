import {
    NavController, NavParams, LoadingController, Loading,
    ViewController, ModalController
} from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { SocialAuthentication, PushService } from '../../services';
import { ProfilePage } from '../profile/profile';
import { Component } from '@angular/core';
import { LoginPage } from './login';
import { Authentication } from '@12stonechurch/ngkit-mobile';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'register-page',
    templateUrl: './register.html',
})
export class RegisterPage {
    /**
     * If the view is a modal.
     *
     * @type {boolean}
     */
    isModal: boolean;

    /**
     * Form model.
     *
     * @type {FormGroup}
     */
    form: FormGroup = new FormGroup({
        firstName: new FormControl(),
        lastName: new FormControl(),
        email: new FormControl(),
        password: new FormControl(),
    });

    /**
     * Form error message.
     *
     * @type {any}
     */
    errors: any = '';

    /**
     * Page Title.
     *
     * @type {string}
     */
    pageTitle: string;

    /**
     * Loading component.
     *
     * @type {LoadingController}
     */
    loader: Loading;

    /**
     * The login page.
     *
     * @type {LoginPage}
     */
    loginPage = LoginPage;

    /**
     * Login page params.
     *
     * @type {Object}
     */
    loginParams: any = {};

    /**
     * Constructor.
     *
     * @param  {FormBuilder} formBuilder
     * @param  {NavController} nav
     * @param  {Authentication} auth
     * @param  {NavParams} params
     */
    constructor(
        public nav: NavController,
        public socialAuth: SocialAuthentication,
        public loading: LoadingController,
        public modal: ModalController,
        public view: ViewController,
        public auth: Authentication,
        public params: NavParams,
        public analytics: AnalyticsService,
        public pushService: PushService
    ) {
        this.loader = this.loading.create();
        this.pageTitle = this.params.get('pageTitle');
        this.loginParams.isModal = this.params.get('isModal') || false;
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit() {
        this.isModal = this.params.get('isModal') || false;
    }

    /**
     * Register the user.
     *
     * @return {void}
     */
    submit(): void {
        if (this.form.valid) {
            this.errors = '';

            this.loader.present();

            this.auth.register(this.form.value).then((res) => {
                this.loader.dismiss().then(() => {
                    this.onRegister();
                });
            }, (error) => {
                this.loader.dismiss();
                this.errors = error.message;
            });
        }
    }

    /**
     * Login with facebook.
     *
     * @return {void}
     */
    loginWithFacebook(): void {
        this.loader.present();

        this.socialAuth.facebookLogin().then((res) => {
            this.loader.dismiss().then(() => {
                this.onRegister();
            });
        }, (error) => {
            this.loader.dismiss();
            this.errors = error.message
        });
    }

    /**
     *	Dismisses the auth modal.
     *
     * @return {[void]}
     */
    cancel(): void {
        this.nextPage();
    }

    /**
     * Post registration navigation.
     *
     * @return {void}
     */
    onRegister(): void {
        
        if (this.auth.user()) {

            this.pushService.registerDevice();

            this.analytics
                .identify(this.auth.user().UserId)
                .profile({
                    '$first_name': this.auth.user().FirstName,
                    '$last_name': this.auth.user().LastName,
                    '$email': this.auth.user().EmailAddress
                });

            this.analytics.trackEvent('Register', this.auth.user());
        }

        this.nextPage(); 
    }

    /**
     * Pushes the next page.
     *
     * @param {boolean} isModal
     */
    nextPage(): void {
        if (this.isModal) {
            if (this.nav.parent) {
                this.nav.parent.getActive().dismiss();
            } else {
                this.view.dismiss();
            }
        } else {
            this.nav.push(ProfilePage);
        }
    }
}
