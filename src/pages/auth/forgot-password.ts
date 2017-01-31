import { FormGroup, FormControl} from '@angular/forms';
import { Component } from '@angular/core';
import {
    NavController, LoadingController, AlertController
} from 'ionic-angular';
import { Authentication } from '@12stonechurch/ngkit-mobile';
import { AuthPage } from '../../pages/auth/auth';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.html',
})
export class ForgotPasswordPage {
    /**
     * Form group of the component.
     * @return {FormGroup}
     */
    form: FormGroup = new FormGroup({
        Email: new FormControl('')
    });

    /**
     * Form errors.
     */
    errors: any = '';

    /**
     * Constructor
     *
     * @param  {NavController} nav
     * @param  {Authentication} auth
     * @param  {NavParams} params
     */
    constructor(
        public nav: NavController,
        public auth: Authentication,
        public loading: LoadingController,
        public alertCtrl: AlertController
    ) { }

    /**
     * Send request to retreive password.
     *
     * @return {void}
     */
    submit(): void {
        let loader = this.loading.create({ content: 'Loading...' });

        loader.present();

        this.auth.forgotPassword(this.form.value).then((res) => {
            loader.dismiss().then(() => {
                this.nav.push(AuthPage);
                this.showAlert();
            });
        }, (error) => {
            this.errors = error.message;

            loader.dismiss();
        });
    }

    /**
     * Alerts the user that the request was sent.
     *
     * @return void
     */
    showAlert(): void {
        let alert = this.alertCtrl.create({
            title: 'Password Reset Request',
            subTitle: 'An email has been sent to the email address provided with instructions on how to reset your password.',
            buttons: ['Okay']
        });

        alert.present();
    }
}
