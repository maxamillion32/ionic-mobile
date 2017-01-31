import { GroupService, GroupModel, LookupService, MinistryPlatformSettingModel, AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { GroupsPage } from '.';
import { MapService } from './../../services';
import { LoginPage } from '../auth/login';
import { Authentication, Event } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'my-groups-page',
    templateUrl: './my-groups.html'
})
export class MyGroupsPage  {
    /**
     * Display groups loading.
     *
     * @type {boolean}
     */
    groupsLoading: boolean = false;

    /**
     * First load of page.
     * 
     * @type {boolean}
     */
    firstLoad : boolean = true;

    /**
     * Login event.
     * 
     * @type{boolean}
     */
    loginEvent: boolean = false;

    /**
     * Group sof the service.
     *
     * @type {GroupModel}
     */
    groups: GroupModel[] = null;

    /**
     * Stringified groups for comparison.
     * 
     * @type {string}
     */
    groupsCompare = '';

    /**
     * Component subscriptions.
     *
     * @type {any}
     */
    subscriptions: any[] = [];

    /**
     * Constructor.
     *
     * @param  {GroupService} groupService
     */
    constructor(
        public nav: NavController,
        public auth: Authentication,
        public mapService: MapService,
        public groupService: GroupService,
        public modal: ModalController,
        public alertCtrl: AlertController,
        public lookupService: LookupService,
        public analyticsService: AnalyticsService,
        public event: Event
    ) { }

    ngOnInit(): void{
        //Initialize all subscriptions
        this.subscriptions['mygroups:change'] = this.event.listen('mygroups:change')
            .subscribe(() => {
                this.loadGroups();
            });
        
        this.subscriptions['user:loggedIn'] = this.event.listen('user:loggedIn')
            .subscribe(() => {
                this.loginEvent = true;
                this.loadGroups();
            });
        
        this.subscriptions['user:loggedOut'] = this.event.listen('user:loggedOut')
            .subscribe(() => {
                this.loginEvent = true;
                this.loadGroups();
            });
    }

    ngAfterViewInit(): void {
        this.preloadMap();
    }

    ionViewWillEnter(): void{
        this.loadGroups();
    }

    /**
     * Preload the map.
     *
     * @return {void}
     */
    preloadMap(): void {
        setTimeout(() => {
            if (!this.mapService.map) {
                this.mapService.createMap();
            }
        }, 1000);
    }

    /**
     * Check if authenticated.
     * @return {boolean}
     */
    isAuthenticated(): boolean{
        if(this.auth.user()) return true;
        return false;
    }

    /**
     * Load the current user's group.
     *
     * @return {void}
     */
    loadGroups(refresher?:any): void {
        if (this.auth.user()) {

            if(this.firstLoad || refresher || this.loginEvent){
                this.groupsLoading = true;
            }

            this.groupService.getUserGroups().then(groups => {

                if (groups.length == 0) {
                    this.groups = null;
                    this.groupsCompare = '';
                    this.loginEvent = false;
                } else {
                    let newGroupsCompare : string = JSON.stringify(groups);

                    if(this.groupsCompare != newGroupsCompare){
                        this.groups = groups;
                        this.groupsCompare = newGroupsCompare;
                        this.loginEvent = false;
                    }
                }

                this.groupsLoading = false;
                this.firstLoad = false;

                if(refresher){
                    refresher.complete();
                }
            });
        } else{
            this.groups = null;
            this.groupsCompare = '';
            this.loginEvent = false;
        }
    }


    /**
     * Get after launch date.
     * 
     * @return{bool}
     * 
     */
    isAfterLaunchDate(): Promise<any>{
        return this.lookupService.getSetting("AppLaunchDate").then((res: MinistryPlatformSettingModel)=>{
            let currentDate = new Date().setHours(0,0,0,0);
            let launchDate = new Date(res.Value);
        
            return currentDate.valueOf() >= launchDate.valueOf();
        });
    }

    /**
     * Go to the groups component.
     *
     * @return {void}
     */
    goToGroups(): void {
        this.isAfterLaunchDate().then((res: boolean) =>{
            if(!res){
                let confirmAlert = this.alertCtrl.create({
                        title: 'Hang On There!',
                        message: 'Groups will not be open for sign ups until January 22nd.',
                        buttons: [{
                            text: 'OK',
                            role: 'cancel'
                        }]
                    });
                    confirmAlert.present();
            } else{
                this.nav.push(GroupsPage);
            }
        });
    }

    /**
     * Opens the login modal.
     *
     * @return {void}
     */
    openLoginModal(): void {
        let modal = this.modal.create(LoginPage, { isModal: true });

        modal.present();

        modal.onDidDismiss(() => {
            if (this.auth.user() && !this.groups) {
                this.loadGroups();
            }
        });
    }

        /**
     * Refresh groups with pull to refresh.
     *
     * @param  {any} refresher
     * @return {void}
     */
    refreshGroups(refresher: any): void {
        this.loadGroups(refresher);
    }

        /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        this.unsubscribe();
        this.subscriptions = [];
    }

    /**
     * Unsubscribe from subscriptions.
     *
     * @return {void}
     */
    unsubscribe(): void {
        Object.keys(this.subscriptions)
            .forEach(k => this.subscriptions[k].unsubscribe());
    }

}
