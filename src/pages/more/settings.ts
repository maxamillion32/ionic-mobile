import { Component } from '@angular/core';
import { UserService, UserSettingsModel, NotificationService } from '@12stonechurch/12Stone-angular-mobile';
import { Event } from '@12stonechurch/ngkit-mobile';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'settings',
    templateUrl: './settings.html',
})
export class SettingsPage {

    settings: UserSettingsModel;
    loading: boolean = true;

    constructor(
        public usersService: UserService,
        public event: Event,
        public notificationService: NotificationService,
        public nav: NavController
        ){}

    ionViewDidEnter(){
        this.usersService.getSettings().then((settings: UserSettingsModel) =>{
            this.settings = settings;
            this.loading = false;
        });
    }

    updateSettings(): void{

        this.usersService.updateSettings(this.settings);
        this.event.broadcast('notifications:change');
        this.nav.pop();
    }
}