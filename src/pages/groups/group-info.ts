import {
    NavController, NavParams, AlertController, ToastController,
    LoadingController, Loading
} from 'ionic-angular';
import {
    GroupService, GroupModel, UserGroupSettingsModel, AnalyticsService
} from '@12stonechurch/12Stone-angular-mobile';
import { Component, OnInit } from '@angular/core';
import { MyGroupsPage } from './my-groups';
import { InAppBrowser, Calendar, Keyboard } from 'ionic-native';
import { Authentication, Event } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'group-info-page',
    templateUrl: './group-info.html',
})
export class GroupInfoPage implements OnInit {
    /**
     * The current group.
     *
     * @type {GroupModel}
     */
    group: GroupModel;

    /**
     * The settings for the group.
     *
     * @type {UserGroupSettingsModel}
     */
    groupSettings: UserGroupSettingsModel;

    /**
     * State of the description toggle.
     *
     * @type {boolean}
     */
    descToggle: boolean = true;

    /**
     * Loading component.
     *
     * @type {LoadingController}
     */
    loader: Loading;

    /**
     * Constructor.
     *
     * @param {NavParams} params
     * @param {GroupService} groupService
     * @param {Authentication} auth
     */
    constructor(
        public nav: NavController,
        public alert: AlertController,
        public toast: ToastController,
        public params: NavParams,
        public groupService: GroupService,
        public auth: Authentication,
        public loading: LoadingController,
        public analyticsService: AnalyticsService,
        public event: Event
    ) {
        this.loader = this.loading.create();
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.groupService.get(this.params.get('group_id')).then(group => {
            this.group = group;
            this.addPermissions();
            this.groupService.getSettings(this.group.GroupId)
                .then(settings => this.groupSettings = settings);
        }, (error) => console.log(error.message));
    }

    ionViewDidEnter(){
        this.analyticsService.trackPageAction('Group Info', 'Page Enter', {groupId: this.params.get('group_id')});
    }


    /**
    * Add permissions for the viewing user.
    *
    * @return {void}
    */
    addPermissions(): void {
        if (this.auth.user() && this.group) {
            let is_a_member = this.group.Participant.GroupParticipantId !== 0;
            let is_a_leader = this.group.Participant.GroupRoleTitle == 'Leader';
            let is_a_coach = this.group.Participant.GroupRoleTitle == 'Coach';

            this.auth.user().allow('view-group', this.group.GroupId, is_a_member);
            this.auth.user().allow('edit-group', this.group.GroupId, () => {
                return is_a_leader || is_a_coach;
            });
        }
    }

    /**
     * Update group settings
     *
     * @return {void}
     */
    updateSettings(): void {
        this.groupService
            .updateSettings(this.group.GroupId, this.groupSettings);
    }

    /**
     * Leaves a group.
     *
     * @return {[void]}
     */
    leaveGroup(): void {
        let groupName = this.group.GroupName;
        let alert = this.alert.create({
            title: 'Leave Group',
            message: `We are sorry to see you go. Please confirm that you would like to leave ${groupName}.<br><br>Mind sharing why you decided to leave?`,
            cssClass: '',
            inputs: [{
                name: 'reason',
                placeholder: '(optional)'
            }],
            buttons: [{ text: 'Cancel' }, {
                text: 'Leave Group',
                handler: reason => {
                    Keyboard.close();
                    this.loader.present();

                    this.groupService.leaveGroup(this.group.GroupId, reason)
                        .then(() => {
                            this.event.broadcast('mygroups:change');
                            this.removePermissions();
                            this.loader.dismiss().then(() => {
                                this.nav.setRoot(MyGroupsPage, {}, {
                                    animate: true
                                }).then(() => this.afterLeave());
                            });
                        });
                }
            }]
        });

        alert.present();
    }

    /**
     * After a user leaves a group.
     *
     * @return {void}
     */
    afterLeave(): void {
        let toast = this.toast.create({
            message: 'You have left the group.',
            duration: 3000,
            position: 'bottom',
            cssClass: ''
        });

        toast.present(toast);
    }

    /**
     * Opens up the location on google maps in-app browser.
     *
     * @return {void}
     */
    getDirections() {
        new InAppBrowser(this.group.GoogleMapsUrl, '_system', 'location=true');
    }

    /**
     * Remove permissions from the group.
     *
     * @return {void}
     */
    removePermissions(): void {
        this.auth.user().disallow('view-group', this.group.GroupId);
        this.auth.user().disallow('edit-group', this.group.GroupId);
    }

    /**
     * Adds the group as an event to the Calendar.
     */
    addToCalendar(): void {
        Calendar.hasReadWritePermission().then(() => {
            this.createEvent();
        }, () => {
            Calendar.requestReadWritePermission().then(() => {
                this.createEvent();
            });
        });
    }

    /**
     * Creates the a calendar event..
     *
     * @param {Date} endDate
     */
    createEvent(): void {
        let startTime = new Date(this.group.FirstMeetingDate);
        let endTime = new Date(startTime.toString());
        endTime.setHours(startTime.getHours() + 2);

        Calendar.createEventWithOptions(
            this.group.GroupName,
            this.group.Address,
            'Group',
            startTime,
            endTime,
            {
                recurrence: this.group.MeetingFrequency.toLowerCase(),
                recurrenceEndDate: this.getEndDate()
            }
        ).then(() => {
            Calendar.openCalendar(startTime);
        });
    }

    /**
     * Gets the End Date of the group.
     *
     * @return {Date}
     */
    getEndDate() {
        let endDate = new Date(this.group.FirstMeetingDate);
        endDate.setDate(endDate.getDate() + 98);

        return endDate;
    }
}
