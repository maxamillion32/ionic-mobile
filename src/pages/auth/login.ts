import { ForgotPasswordPage } from './forgot-password';
import { NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
    selector: 'login-page',
    templateUrl: './login.html',
})
export class LoginPage {
    /**
     * If the view is a modal.
     *
     * @type {boolean}
     */
    isModal: boolean;

    /**
     * The forgot password page.
     *
     * @type {ForgotPassword}
     */
    forgotPassword = ForgotPasswordPage;

    /**
     * Constructor.
     *
     * @param  {NavParams} params
     */
    constructor(public params: NavParams) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit() {
        this.isModal = this.params.get('isModal') || false;
    }
}
