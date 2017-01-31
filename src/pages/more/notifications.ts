import { Component } from '@angular/core';
import { AnalyticsService, NotificationService, NotificationModel, GroupService, UserModel } from '@12stonechurch/12Stone-angular-mobile';
import { PushService } from '../../services/push';
import { Event, Cache } from '@12stonechurch/ngkit-mobile';
import { NavController, AlertController } from 'ionic-angular';
import { GroupMessagePage } from '../groups/group-message';
import * as moment from 'moment';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.html',
})
export class NotificationsPage {

    notifications : NotificationModel[] = [];
    cachedNotifications: NotificationModel[] = [];
    loading: boolean = false;
    subscriptions: any[] = [];

    constructor(
        public analyticsService : AnalyticsService,
        public pushService: PushService,
        public notificationService: NotificationService,
        public event: Event,
        public alertCtrl: AlertController,
        public groupService: GroupService,
        public nav: NavController,
        public cache: Cache){}

    ngOnInit(){

        this.subscriptions['notifications:checkCount'] = this.event.listen('notifications:checkCount')
            .subscribe(() => {
                this.loadNotifications();
            });
    }

    ionViewWillEnter(): void{
        if(this.cache.has('user:notifications')){
            this.notifications = this.cache.get('user:notifications');
        }

        this.loadNotifications();
    }

    ionViewDidEnter(){
        this.analyticsService.trackPageAction('Notifications', 'Page Enter');
    }

    getItemBackgroundColor(notification : NotificationModel) : string{
        if(notification.IsRead){
            return "white";
        } else {
            return "#e9e9e9";
        }
    }

    getMessage(notification : NotificationModel) : string{
        let payloadData = JSON.parse(notification.PayloadData);
        let user : UserModel = payloadData.User;
        let message : string = "";

        switch(payloadData.ModuleName){
            case "Groups":
                switch(payloadData.ActionName){
                    case "Group Chat":
                        message = "<strong>" + user.Nickname + " " + user.LastName + "</strong> posted a chat in the group <strong>" + payloadData.GroupName + "</strong>"; 
                    break;
                    case "Notebook Chat":
                        message = "<strong>" + user.Nickname + " " + user.LastName + "</strong> posted a notebook entry in the group <strong>" + payloadData.GroupName + "</strong>";
                    break;
                }
                break;
        }

        return message;
    }

    getTimeAgo(notification: NotificationModel): string {
        return moment(notification.SentDate).fromNow();
    }

    getUser(notification: NotificationModel): UserModel{
        let payloadData = JSON.parse(notification.PayloadData);
        return payloadData.User;
    }

    loadNotifications(refresher?:any): void{
        if(!this.cache.has('user:notifications') || refresher){
            this.loading = true;
        }

        this.notificationService.markAllViewed().then(()=>{
            this.notificationService.get().then((notifications:NotificationModel[]) => {
                if(notifications.length == 0){
                    this.notifications = [];
                } else{
                    let notificationsCompare : string = JSON.stringify(this.cache.get('user:notifications'));
                    let newNotificationsCompare : string = JSON.stringify(notifications);

                    if(notificationsCompare != newNotificationsCompare){
                        this.notifications = notifications;
                        this.cache.set('user:notifications', notifications);
                    }
                }

                this.loading = false;
                this.pushService.clearBadge();
                this.event.broadcast('notifications:read');


                if(refresher){
                    refresher.complete();
                }
            });
        });
    }

    processNotification(notification: NotificationModel): void{
        this.notificationService.updateNotification(notification.NotificationId, true, true);

        let payloadData = JSON.parse(notification.PayloadData);

            switch(payloadData.ModuleName){
                case "Groups":
                    switch(payloadData.ActionName){
                        case "Group Chat":
                            this.groupService.get(payloadData.GroupId).then((group) =>{
                                this.nav.push(GroupMessagePage, {group: group, message_id: payloadData.ChatId});
                            });
                        break;
                        case "Notebook Chat":
                        let confirmAlert = this.alertCtrl.create({
                            title: 'Go To The Web',
                            message: 'Meeting notes are not yet available on the mobile app.',
                            buttons: [{
                                text: 'OK',
                                role: 'cancel'
                            }]
                        });
                        confirmAlert.present();
                        break;
                    }
                    break;
            }
    }

    refreshGroups(refresher:any):void{
        this.loadNotifications(refresher);
    }

    ngOnDestroy(): void {
        this.unsubscribe();
        this.subscriptions = [];
    }

    unsubscribe(): void {
        Object.keys(this.subscriptions)
            .forEach(k => this.subscriptions[k].unsubscribe());
    }
}
