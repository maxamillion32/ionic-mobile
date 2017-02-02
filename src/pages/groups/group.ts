import {
    NavController, NavParams, InfiniteScroll, ViewController, AlertController,
    ModalController, LoadingController
} from 'ionic-angular';
import {
    GroupService, GroupModel, GroupMessageService, GroupMessageModel, AnalyticsService
} from '@12stonechurch/12Stone-angular-mobile';
import { GroupMessageFormPage } from './group-message-form';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GroupMembersPage, GroupInfoPage } from '.';
import { Authentication, Event } from '@12stonechurch/ngkit-mobile';
import { AuthPage } from '../auth/auth';
import { SocialSharing } from 'ionic-native';
import { twelveStoneAngularConfig } from './../../app/config';

@Component({
    selector: 'group-page',
    templateUrl: './group.html',
})
export class GroupPage implements OnInit {
    /**
     * Infinite scroll element.
     */
    @ViewChild(InfiniteScroll) infiniteScroll;

    /**
     * The current user.
     *
     * @type {object}
     */
    user: any = {};

    /**
     * The current group.
     *
     * @type {GroupModel}
     */
    group: GroupModel;

    /**
     * The current group ID.
     * 
     * @type{number}
     * 
     */
    groupId: number = 0;

    /**
     * The message form page.
     *
     * @type {GroupMessageFormPage}
     */
    messageForm = GroupMessageFormPage;

    /**
     * The message form params.
     *
     * @type {GroupMessageFormPage}
     */
    messageFormParams: any;

    /**
     * Messages of the group.
     *
     * @type {GroupMessageModel[]}
     */
    messages: GroupMessageModel[] = [];

    /**
     * Meta about messages pagination.
     *
     * @type {any}
     */
    messagesMeta: any;

    /**
     * State of all messages being loaded.
     *
     * @type {boolean}
     */
    allMessagesLoaded: boolean = false;

    /**
     * The loading state of joining a group.
     *
     * @type {boolean}
     */
    joining: boolean;

    /**
     * The loading state of the component.
     *
     * @type {boolean}
     */
    loading: boolean;

    /**
     * 
     * New chats available
     * 
     * @type{boolean}
     */
    showChatChange: boolean = false;

    /**
     * Constructor.
     *
     * @param {GroupService} groupService
     */
    constructor(
        public nav: NavController,
        public params: NavParams,
        public groupMessageService: GroupMessageService,
        public alertCtrl: AlertController,
        public groupService: GroupService,
        public view: ViewController,
        public auth: Authentication,
        public modal: ModalController,
        public event: Event,
        public analyticsService: AnalyticsService,
        public loader: LoadingController
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.onMessageCreated();
        this.onMessageUpdated();
        this.onMessageDeleted();

        this.infiniteScroll.enable(false);
    }

    /**
     * Ionic view has been entered.
     *
     * @return {void}
     */
    ionViewDidEnter(): void {
        this.user = this.auth.user();

        if (this.params.get('group_id')) {
            this.groupId = this.params.get('group_id');
        }

        this.getGroup();

        if (this.auth.user() && this.auth.user().can('view-group', this.groupId)) {
            this.groupMessageService.subscribeToMessages(this.groupId);
        }

        this.analyticsService.trackPageAction('Group', 'Page Enter', {groupId: this.groupId});
    }

    /**
     * Ionic view has been left.
     *
     * @return {void}
     */
    ionViewWillLeave() {
        if (this.auth.user() && this.auth.user().can('view-group', this.groupId)) {
            this.groupMessageService.unsubscribeFromMessages(this.groupId);
        }
    }

    /**
     * Get the group from the API.
     *
     * @return {void}
     */
    getGroup(controlLoading: boolean = true): void {
        if(controlLoading){
            this.loading = true;
        }

        this.groupService.get(this.groupId)
            .then(group => {
                this.group = group;
                this.initMessages();

                if(controlLoading){
                    this.loading = false;
                }
            });
    }

    /**
     * Init the group messages.
     */
    initMessages(): void {
        this.messageFormParams = { group: this.group };

        this.setPermissions();

        this.getMessages().then(() => {
            this.infiniteScroll.enable(true);
        }, () => { });
    }

    /**
    * Add permissions for the viewing user.
    *
    * @return {void}
    */
    setPermissions(): void {
        if (this.auth.user() && this.group && this.group.Participant) {
            let is_a_member = this.group.Participant.GroupParticipantId !== 0;
            let is_a_leader = this.group.Participant.GroupRoleTitle == 'Leader';
            let is_a_coach = this.group.Participant.GroupRoleTitle == 'Coach';

            this.auth.user().allow('view-group', this.groupId, () => {
                return is_a_member || is_a_leader || is_a_coach
            });
            this.auth.user().allow('edit-group', this.groupId, () => {
                return is_a_leader || is_a_coach;
            });
            this.auth.user().allow('write-message', this.groupId, () => {
                return is_a_member || is_a_leader;
            });
        }
    }

    /**
     * Join a group.
     *
     * @return {void}
     */
    joinGroup(): void {
        if (this.auth.user()) {
            this.joining = true;
            this.groupService.joinGroup(this.groupId)
                .then(group => {
                    this.joinedGroupAlert();
                    this.onJoinGroupSuccess(group);
                    this.analyticsService.trackPageAction('Groups', 'Join Group', {groupId: this.groupId});
                }, error => {
                    this.joining = false;
                    alert(error.message)
                });
        } else {
            this.openAuthModal();
        }
    }

    /**
     * On join group success.
     *
     * @return {void}
     */
    onJoinGroupSuccess(group): void {
        this.event.broadcast('mygroups:change');
        this.joining = false;
        this.group = new GroupModel(group);
        this.setPermissions();
        this.getMessages().then(() => {
            this.infiniteScroll.enable(true);
            this.groupMessageService.subscribeToMessages(this.groupId);
        }, () => { });
    }

    /**
     * Alerts user when they join a group.
     *
     * @return {void}
     */
    joinedGroupAlert(): void {
        let groupName = this.group.GroupName;
        let alert = this.alertCtrl.create({
            title: 'Thanks For Joining',
            subTitle: `You have successfully joined ${groupName}.<br>One of your group leaders will be in touch with you shortly.`,
            buttons: ['Ok']
        });

        alert.present();
    }

    /**
     * Share the group.
     *
     * @return {void}
     */
    socialShare(): void {
        var url = this.group.WebUrl.replace('{appRootUrl}', twelveStoneAngularConfig.appRootUrl)
        let text = `Check out this group at 12Stone called ${this.group.GroupName}!  ${url}`;
        let subject = `Join me in: ${this.group.GroupName}`;

        this.analyticsService.trackPageAction('Groups', 'Group Shared', {groupId: this.groupId});
        SocialSharing.share(text, subject, '');
    }

    /**
     * Go to the group info page.
     *
     * @param {number} id
     * @return {void}
     */
    goToGroupInfo(id: number): void {
        this.nav.push(GroupInfoPage, { group_id: id });
    }

    /**
     * Go to the group members page.
     *
     * @param {number} id
     * @return {void}
     */
    goToGroupMembers(id: number): void {
        this.nav.push(GroupMembersPage, { group_id: id });
    }

    /**
     * Get group's messages.
     *
     * @param  {boolean} refresh
     * @return {void}
     */
    getMessages(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.auth.user() && this.auth.user().can('view-group', this.groupId)) {
                this.groupMessageService.listMessages(this.groupId, {
                    Limit: 10,
                    Sort: 'Created|desc'
                }).then(res => {
                    this.messagesMeta = res;
                    this.messages = res.Results;
                    resolve(this.messages);
                }, error => reject(error));
            } else {
                reject(false);
            }
        });
    }

    /**
     * Load more messages from the API.
     *
     * @return {Promise<GroupMessageModel[]>}
     */
    moreMessages(): Promise<GroupMessageModel[]> {
        return new Promise((resolve, reject) => {
            if (this.messagesMeta.NextPageNumber) {
                this.groupMessageService.listMessages(this.groupId, {
                    Limit: this.messagesMeta.Limit,
                    Page: this.messagesMeta.NextPageNumber,
                    Sort: 'Created|desc'
                }).then(res => {
                    this.messagesMeta = res;
                    this.messages = this.messages.concat(res.Results);
                    resolve(this.messages);
                }, error => reject(error));
            } else {
                reject(false);
            }
        });
    }

    /**
     * Load more messages.
     *
     * @params  {any} infiniteScroll
     * @return {void}
     */
    loadMessages(infiniteScroll: any): void {
        this.moreMessages().then(() => {
            infiniteScroll.complete();
        }, () => {
            this.allMessagesLoaded = true;
            infiniteScroll.enable(false);
            infiniteScroll.complete();
        });
    }

    /**
     * Refresh messages with pull to refresh.
     *
     * @param  {any} refresher
     * @return {void}
     */
    refresher(refresher: any): void {
        this.loading = true;
        this.getMessages().then(() => {
            this.getGroup(false);
            this.allMessagesLoaded = false;
            this.infiniteScroll.enable(true);
            this.loading = false;
            this.event.broadcast('mygroups:changed');
            refresher.complete();
        });
    }

    /**
     * Listener for created messages from service.
     *
     * @return {void}
     */
    onMessageCreated(): void {
        this.groupMessageService
            .observers['message:created'].subscribe(message => {
                this.showChatChange = true;
            });
    }

    /**
     * Listener for updated messages from service.
     *
     * @return {void}
     */
    onMessageUpdated(): void {
        this.groupMessageService
            .observers['message:updated'].subscribe(message => {
                this.showChatChange = true;
            });
    }

    /**
     * Listener for deleted messages from service.
     *
     * @return {void}
     */
    onMessageDeleted(): void {
        this.groupMessageService
            .observers['message:deleted'].subscribe(m => {
                this.showChatChange = true;
            });
    }

    /**
     * Returns the title of the previous view.
     *
     * @return {string}
     */
    previousTitle(): string {
        let previousTitle = 'Back';
        let previousView = this.nav.getPrevious(this.view);

        if (previousView.name == 'MyGroupsPage') {
            previousTitle = 'My Groups';
        }

        return previousTitle;
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

    /**
     * Gets new messages.
     * 
     * @return{void}
     */
    getNewMessages():void{

        let loading = this.loader.create({
            content: 'Refreshing Messages...'
        });

        loading.present();

        this.getMessages().then(()=>{
            setTimeout(() => {
                loading.dismiss();
            }, 1000);
        });
    }
}
