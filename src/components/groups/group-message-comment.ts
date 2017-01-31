import { GroupMessageService } from '@12stonechurch/12Stone-angular-mobile';
import { Component, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Authentication } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'group-message-comment',
    templateUrl: './group-message-comment.html'
})
export class GroupMessageCommentComponent {
    /**
     * Removed state of a comment.
     *
     * @type {boolean}
     */
    removed: boolean = false;

    /**
     * Comment of the component.
     */
    @Input() comment;

    /**
     * Group of the component.
     */
    @Input() group;

    /**
     * Constructor.
     */
    constructor(
        public auth: Authentication,
        public groupMessageService: GroupMessageService,
        public alert: AlertController
    ) { }

    /**
     * On component init.
     * @return {void}
     */
    ngOnInit(): void {
        this.addPermissions();
    }

    /**
    * Add permissions for the viewing user.
    *
    * @return {void}
    */
    addPermissions(): void {
        if (this.auth.user()) {
            let is_creator = this.comment.User.UserId == this.auth.user().UserId;
            let is_a_leader = this.group.Participant.GroupRoleTitle == 'Leader';
            let is_a_coach = this.group.Participant.GroupRoleTitle == 'Coach';

            this.auth.user().allow('edit-comment', this.comment.ChatId, () => {
                return is_creator || is_a_leader || is_a_coach;
            });
        }
    }

    /**
     * Delete a comment.
     *
     * @return {void}
     */
    deleteComment(): void {
        this.removed = true;

        this.groupMessageService
            .deleteComment(this.group.GroupId, this.comment.ChatId)
            .then(() => { }, () => { });
    }

    /**
     * Confirm delete.
     *
     * @param  {any} comment
     * @return {void}
     */
    confirmDeleteComment(comment: any): void {
        let alert = this.alert.create({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => { }
                },
                {
                    text: 'Yes',
                    role: 'destructive',
                    handler: () => this.deleteComment()
                }
            ]
        });

        alert.present();
    }
}
