import { ProfilePage } from './../profile/profile';
import { Component, ViewChild } from '@angular/core';
import { RegisterPage } from './register';
import { NavParams } from 'ionic-angular';
import { Authentication } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'auth-page',
    templateUrl: './auth.html',
})
export class AuthPage {

    /**
     * The nav of the component.
     *
     * @param  {NavController} 'nav'
     */
    @ViewChild('nav') nav;

    /**
     * Constructor.
     *
     * @param  {NavParams} params
     */
    constructor(
        public params: NavParams,
        public auth: Authentication
    ) {}

    ngOnInit():void{
        this.setPage();
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ionViewWillEnter(): void {
        this.setPage();
    }

    setPage():void{
        if (this.auth.user()) {
            this.nav.setPages([{
                page: ProfilePage
            }]);
        } else {
            this.nav.setPages([{
                page: RegisterPage,
                params: this.params.data
            }]);
        }
    }
}
