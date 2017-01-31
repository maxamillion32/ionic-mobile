import { Injectable } from '@angular/core';
import { Event, Authentication, Cache } from '@12stonechurch/ngkit-mobile';
import { Platform } from 'ionic-angular';
import { Push, PushToken } from '@ionic/cloud-angular';
import { NotificationService, ApiMessageModel, UserService } from '@12stonechurch/12Stone-angular-mobile';

@Injectable()
export class PushService {

    badgeCount: number = 0;

    /**
     * Constructor.
     */
    constructor(
        public event: Event,
        public push: Push,
        public notificationService: NotificationService,
        public auth: Authentication,
        public platform: Platform,
        public userService: UserService,
        public cache: Cache) {}

    /**
     * Get if in-app notifications are allowed
     */

    /**
     * Clear all notifications.
     * 
     * @return{void}
     */
    clearBadge():void{

        //Return if not cordova
        if(!this.platform.is('cordova')){return;}

        //Clear notifications badges
        this.push.plugin.clearAllNotifications(() => {
                console.log('clear notifications sucess');
            }, ()=>{
                console.log('clear notifications error');
            });
    }

    /**
     * Register device for push notifications.
     * 
     * @return{void}
     */
    registerDevice(): void{

        //Return if not cordova
        if(!this.platform.is('cordova')){return;}

        //Perform device registration
        if(this.auth.user()){
            this.push.register().then((t: PushToken) => {
                return this.push.saveToken(t);
            }).then((t: PushToken) => {
                
                //Register token
                if(this.cache.has('pushToken')){
                    let cacheToken: string = this.cache.pull('pushToken');

                    if(cacheToken != t.token){
                        this.notificationService.unregister(cacheToken).then(() => {
                            this.notificationService.register(t.token);
                        });
                    }
                } else {
                    this.notificationService.register(t.token);
                }

                //Set the badge count
                this.notificationService.getBadgeCount().then((count) =>{
                    this.setBadge(count);
                });

                //Set the token in cache
                this.cache.set('pushToken', t.token);

                //What to do on receiving notification
                this.push.rx.notification().subscribe((msg) => {
                        //placeholder
                });
            });
        }
    }

    /**
     * Set the badge count.
     * 
     * @return{void}
     */
    setBadge(count: number): void{

        //Return if not cordova
        if(!this.platform.is('cordova')){return;}

        //Set the badge
        this.push.plugin.setApplicationIconBadgeNumber(() =>{
            console.log('badge count success');
        }, ()=>{
            console.log('badge count failure');
        }, count);

    }

    /**
     * Unregister device for push notifications.
     * 
     * @return{void}
     */
    unregisterDevice(): void{

        //Return if not cordova
        if(!this.platform.is('cordova')){return;}

        if(this.push && this.push.token && this.push.token.token){
            
            //Remove push device registration
            this.notificationService.unregister(this.push.token.token).then((res:ApiMessageModel) => {
                console.log(res.message);
            });

            this.clearBadge();
            this.push.unregister();
        }
    }
}