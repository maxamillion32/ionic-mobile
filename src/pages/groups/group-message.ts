import {
    GroupMessageService, GroupMessageModel, GroupModel, AnalyticsService
} from '@12stonechurch/12Stone-angular-mobile';
import { Component, ViewChild, forwardRef } from '@angular/core';
import {
    NavParams, NavController, ViewController, ActionSheetController,
    AlertController
} from 'ionic-angular';
import { GroupMessageCardComponent } from '../../components/groups';
import { GroupMessageFormPage } from './group-message-form';
import { BodyClass } from '../../services';
import { Authentication } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'group-message-page',
    templateUrl: './group-message.html',
})
export class GroupMessagePage {
    /**
     * The current message.
     *
     * @type {GroupMessageModel}
     */
    message: GroupMessageModel;

    /**
     * The comment form.
     *
     * @type {FormGroup}
     */
    comment: GroupMessageModel = new GroupMessageModel({});

    /**
     * The loading state of the comment form.
     *
     * @type {boolean}
     */
    loading: boolean = false;

    /**
     * The group of the message.
     *
     * @type {GroupModel}
     */
    group: GroupModel;

    /**
     * The message card.
     */
    @ViewChild(forwardRef(() => GroupMessageCardComponent)) messageCard: GroupMessageCardComponent;

    /**
     * Constructor.
     *
     * @param  {NavParams} params
     */
    constructor(
        public params: NavParams,
        public groupMessageService: GroupMessageService,
        public nav: NavController,
        public view: ViewController,
        public bodyClass: BodyClass,
        public actionSheet: ActionSheetController,
        public alert: AlertController,
        public auth: Authentication,
        public analytics: AnalyticsService
    ) {
        this.group = this.params.get('group');
        this.onMessageUpdated();
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.groupMessageService
            .getMessage(this.group.GroupId, this.params.get('message_id'))
            .then(message => {
                this.message = message;
                this.addPermissions();
            }, error => alert('Message not found'));
    }

    /**
    * Add permissions for the viewing user.
    *
    * @return {void}
    */
    addPermissions(): void {
        if (this.auth.user()) {
            let is_creator = this.message.User.UserId == this.auth.user().UserId;
            let is_a_leader = this.group.Participant.GroupRoleTitle == 'Leader';
            let is_a_member = this.group.Participant.GroupParticipantId !== 0;

            this.auth.user().allow('edit-message', this.message.ChatId, () => {
                return is_creator || is_a_leader;
            });

            this.auth.user().allow('write-comment', this.message.ChatId, () => {
                return is_creator || is_a_leader || is_a_member;
            });
        }
    }

    /**
     * On View will enter.
     *
     * @return {void}
     */
    ionViewWillEnter(): void {
        this.bodyClass.add('entering-groups');
    }

    /**
     * On View did enter.
     *
     * @return {void}
     */
    ionViewDidEnter(): void {
        this.bodyClass.add('groups');
        this.bodyClass.remove('entering-groups');
    }

    /**
     * On View will leaave.
     *
     * @return {void}
     */
    ionViewWillLeave(): void {
        this.bodyClass.remove('groups');
    }

    /**
     * Post a comment to the message.
     *
     * @return {void}
     */
    postComment(): void {
        if (this.loading) return;

        this.loading = true;

        this.groupMessageService.postComment(
            this.group.GroupId,
            this.params.get('message_id'),
            this.comment
        ).then(comment => {
            this.loading = false;
            this.messageCard.comments = this.messageCard.comments.concat([comment]);
            this.comment.Body = '';
        }, error => {
            this.loading = false;
            alert('There was an eror posting your comment.')
        });
    }

    /**
     * Diplay the message popover.
     *
     * @return {void}
     */
    presentActions(event): void {
        let actionSheet = this.actionSheet.create({

            title: this.message.Title,
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        actionSheet.dismiss().then(() => {
                            this.nav.push(GroupMessageFormPage, {
                                group: this.group,
                                message: this.message
                            });
                        });

                        return false;
                    }
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.deleteMessage();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => actionSheet.dismiss()
                }
            ]
        });

        actionSheet.present();
    }

    /**
     * Delete the current message.
     *
     * @return {void}
     */
    deleteMessage(): void {
        let alert = this.alert.create({
            title: 'Delete Message',
            message: 'Are you sure you want to delete this message?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => alert.dismiss()
                },
                {
                    text: 'Yes',
                    role: 'destructive',
                    handler: () => {
                        alert.dismiss().then(() => {
                            this.groupMessageService
                                .deleteMessage(this.group.GroupId, this.message.ChatId)
                                .then(() => {
                                    this.nav.pop();
                                });
                        });
                    }
                }
            ]
        });

        alert.present();
    }

    /**
     * Listener for deleted comments from service.
     *
     * @return {void}
     */
    onMessageUpdated() {
        this.groupMessageService
            .observers['message:updated'].subscribe(message => {
                if (message.ChatId == this.message.ChatId) {
                    this.message = message;
                }
            });
    }
}
