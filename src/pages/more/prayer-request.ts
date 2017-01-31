import { FormGroup, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { PrayerRequestService, AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';
import { Authentication } from '@12stonechurch/ngkit-mobile';
import { AuthPage } from '../auth/auth';

@Component({
    selector: 'prayer-request-page',
    templateUrl: './prayer-request.html',
})
export class PrayerRequestPage {
    /**
     * the prayer request form.
     *
     * @type {FormGroup}
     */
    form: FormGroup = new FormGroup({
        "request": new FormControl('')
    });

    /**
     * Constructor.
     *
     * @param  {NavController}  nav
     * @param  {Authentication} auth
     */
    constructor(
        public nav: NavController,
        public auth: Authentication,
        public prayerRequestService: PrayerRequestService,
        public alertCtrl: AlertController,
        public analyticsService: AnalyticsService,
        public modal: ModalController
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.auth.check().then(token => { }, error => {
            this.openAuthModal();
        });
    }

    /**
     * Submit prayer request.
     *
     * @return {void}
     */
    submit(): void {
        this.auth.check().then(token => {
            this.prayerRequestService.postPrayerRequest(this.form.value)
                .then((res) => {
                    this.analyticsService.trackPageAction("Prayer Request", "Submit Prayer Request", { request: this.form.value });
                    this.nav.pop();
                    this.showAlert();
                }, (error) => console.log(error.message));
         },
         error => {
             this.openAuthModal();
         });
    }

    /**
     * Alerts the user that the request was sent
     * @return {alert}
     */
    showAlert() {
        let alert = this.alertCtrl.create({
            title: 'Thank You!',
            subTitle: 'Your prayer request has been sent.',
            buttons: ['Okay']
        });

        alert.present();
    }

    /**
     * Opens the auth modal.
     *
     * @return {[void]}
     */
    openAuthModal(): void {
        let modal = this.modal.create(AuthPage, { isModal: true });
        modal.present();
    }
}
