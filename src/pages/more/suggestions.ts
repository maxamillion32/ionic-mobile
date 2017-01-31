import { FormGroup, FormControl }from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'suggestions-page',
    templateUrl: './suggestions.html',
})
export class SuggestionsPage {
    /**
     * The suggestion form.
     *
     * @type {FormGroup}
     */
    form: FormGroup = new FormGroup({
        ["suggestion"]: new FormControl()
    });

    /**
     * Constructor.
     *
     * @param  {NavController}  nav
     * @param  {Authentication} auth
     */
    constructor(
        public nav: NavController,
        public alertCtrl: AlertController,
        public analyticsService: AnalyticsService
    ) { }

    /**
     * Submit suggestion.
     *
     * @return {void}
     */
    submit(): void {
        SocialSharing.canShareViaEmail().then(() => {
            SocialSharing.shareViaEmail(
                this.form.value.suggestion,
                'Mobile App Suggestions',
                ['webadmin@12stone.com']
            ).then(() => {
                this.analyticsService.trackPageAction("Suggestions", "Submit Suggestion", { request: this.form.value.suggestion });
                this.showAlert;
            });
        });
    }

    /**
     * Alerts the user that the suggestion was sent.
     *
     * @return {void}
     */
    showAlert(): void {
        let alert = this.alertCtrl.create({
            title: 'Thank You!',
            subTitle: 'Your suggestion has been sent.',
            buttons: ['Okay']
        });

        alert.present();
    }
}
