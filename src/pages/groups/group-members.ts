import { NavController, NavParams } from 'ionic-angular';
import { GroupService, GroupMemberModel, AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';
import { Component, OnInit} from '@angular/core';
import { SocialSharing } from 'ionic-native';

@Component({
    selector: 'group-members-page',
    templateUrl: './group-members.html',
})
export class GroupMembersPage implements OnInit {
    /**
     * The members of the component.
     *
     * @type {GroupMemberModel[]}
     */
    members: GroupMemberModel[];

    /**
     * The loading state of the component.
     *
     * @type {boolean}
     */
    loading: boolean;

    /**
     * Constructor.
     *
     * @param {GroupService} groupService
     */
    constructor(
        public nav: NavController,
        public params: NavParams,
        public groupService: GroupService,
        public analyticsService: AnalyticsService
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void { }

    /**
     * On view loaded.
     *
     * @return {void}
     */
    ionViewDidLoad(): void {
        this.loading = true;

        this.groupService.getMembers(this.params.get('group_id'))
            .then(members => {
                this.members = members;
                this.loading = false;
            });
    }

    ionViewDidEnter(){
        this.analyticsService.trackPageAction('Group Members', 'Page Enter', {group: this.params.get('group_id')});
    }

    /**
     * Get a sanatizes sms url.
     *
     * @param  {GroupMemberModel} member
     * @return {void}
     */
    smsShare(member: GroupMemberModel): void {
        SocialSharing.shareViaSMS("",member.UserProfile.MobilePhone);
    }
}
