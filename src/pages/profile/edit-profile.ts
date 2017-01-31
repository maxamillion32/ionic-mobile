import {
    NavController, NavParams, ActionSheetController, LoadingController
} from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Camera } from 'ionic-native';
import { ProfilePage } from './profile';
import { UserService } from './../../services'
import { Component } from '@angular/core';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'edit-profile-page',
    templateUrl: './edit-profile.html',
})
export class EditProfilePage {
    /**
     * The current user being edited.
     *
     * @type {any}
     */
    user: any;

    /**
     * The form used to update the user.
     *
     * @type {FormBuilder}
     */
    form: FormGroup;

    /**
     * Constructor.
     *
     * @param  {NavController} nav
     * @param  {Http} http
     */
    constructor(
        private nav: NavController,
        public params: NavParams,
        private actionSheet: ActionSheetController,
        private loading: LoadingController,
        private userService: UserService,
        public analyticsService : AnalyticsService
    ) {
        this.user = params.get('user');

        this.form = new FormGroup({
            'Nickname': new FormControl(this.user.Nickname),
            'FirstName': new FormControl(this.user.FirstName),
            'LastName': new FormControl(this.user.LastName),
            'EmailAddress': new FormControl(this.user.EmailAddress),
            'Password': new FormControl(''),
            'MobilePhone': new FormControl(this.user.MobilePhone),
            'AddressLine1': new FormControl(this.user.AddressLine1),
            'AddressLine2': new FormControl(this.user.AddressLine2),
            'City': new FormControl(this.user.City),
            'StateRegion': new FormControl(this.user.StateRegion),
            'PostalCode': new FormControl(this.user.PostalCode),
            'CampusId': new FormControl(this.user.CampusId)
        });
    }

    /**
     * Go to the regisgration form.
     *
     * @params {object}
     */
    submit(): void {
        let loader = this.loading.create();

        loader.present();

        let data = Object.assign(this.user, this.form.value);

        this.userService.update(data).then(user => {
            loader.dismiss().then(() => {
                this.nav.push(ProfilePage, {
                    user: user
                });
            })
        });
    }

    /**
     * Display action sheet to update photo.
     *
     * @return {void}
     */
    imageActionSheet(): void {
        let actionSheet = this.actionSheet.create({
            title: 'Change Profile Photo',
            buttons: [
                {
                    text: 'Take Photo',
                    handler: () => this.getImage()
                },
                {
                    text: 'Choose From Library',
                    handler: () => this.getImage({ sourceType: 0 })
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });

        actionSheet.present(actionSheet);
    }

    /**
     * Take a photo with the camera.
     *
     * @param  {object} options
     * @return {void}
     */
    getImage(options = {}): void {
        let defaults = {
            destinationType: 0,
            targetHeight: 640,
            targetWidth: 640,
        };

        let CameraOptions = Object.assign(defaults, options);

        Camera.getPicture(CameraOptions).then((imageData) => {
            let base64Image = "data:image/jpeg;base64," + imageData;
            this.updatePhoto(base64Image);
        }, (error) => { });
    }

    /**
     * Update the user's photo.
     *
     * @return {void}
     */
    updatePhoto(data): void {
        let loader = this.loading.create();

        loader.present();

        this.userService.updatePhoto(data)
            .then(res => {
                this.user.Photos = res;
                loader.dismiss()
            }, error => console.error(error));
    }
}
