import { GroupMessagePage } from '../../pages/groups/group-message';
import { GroupMessageService, GroupMessageModel } from '@12stonechurch/12Stone-angular-mobile';
import { Component, Input } from '@angular/core';
import { Authentication } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'group-message-card',
    templateUrl: './group-message-card.html'
})
export class GroupMessageCardComponent {
    /**
     * Message of the component.
     */
    @Input() message;

    /**
     * Group of the component.
     */
    @Input() group;

    /**
     * Display message comments in the card.
     */
    @Input() displayComments: boolean = false;

    /**
     * The group message page.
     *
     * @type {any}
     */
    groupMessage: any = null;

    /**
     * Params to send to the group message page.
     *
     * @type {any}
     */
    groupMessageParams: any = null;

    /**
     * Comment pagination meta.
     *
     * @type {any}
     */
    commentMeta: any;

    /**
     * The comments of the message.
     *
     * @type {GroupMessageModel}
     */
    comments: GroupMessageModel[] = [];

    /**
     * State of all comments being loaded.
     *
     * @type {boolean}
     */
    allCommentsLoaded: boolean = false;

    /**
     * Infinite scroll element of comments.
     *
     * @type {InfinitScroll}
     */
    infiniteScroll: any;

    /**
     * Constructor.
     */
    constructor(
        public groupMessageService: GroupMessageService,
        public auth: Authentication
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        if (!this.displayComments) {
            this.groupMessage = GroupMessagePage;
        } else {
            this.onCommentCreated();
            this.onCommentDeleted();
            this.onCommentUpdated();
            this.groupMessageService
                .subscribeToComments(this.group.GroupId, this.message.ChatId);
        }

        if (this.group && this.message) {
            this.groupMessageParams = {
                group: this.group,
                message_id: this.message.ChatId,
            }

            if (this.displayComments) {
                this.getComments();
            }
        }
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ionViewWillLeave(): void {
        if (this.displayComments) {
            this.groupMessageService.unsubscribeToComments(this.group.GroupId);
        }
    }

    /**
     * Get comments from the api.
     *
     * @return {Promise<any>}
     */
    getComments() {
        return new Promise((resolve, reject) => {
            if (this.group && this.message) {
                this.groupMessageService
                    .listComments(this.group.GroupId, this.message.ChatId, {
                        Limit: 10,
                        Sort: 'Created|asc'
                    }).then(res => {
                        this.commentMeta = res;
                        this.comments = res.Results;
                        resolve(this.message.Replies);
                    }, error => reject(error));
            } else {
                reject(false);
            }
        });
    }

    /**
     * Load more comments from the API.
     *
     * @return {Promise<GroupMessageModel[]>}
     */
    moreComments(): Promise<GroupMessageModel[]> {
        return new Promise((resolve, reject) => {
            if (this.commentMeta.NextPageNumber) {
                this.groupMessageService.listComments(this.group.GroupId, this.message.ChatId, {
                    Limit: this.commentMeta.Limit,
                    Page: this.commentMeta.NextPageNumber,
                    Sort: 'Created|asc'
                }).then(res => {
                    this.commentMeta = res;
                    this.comments = this.comments.concat(res.Results);
                    resolve(this.message.Replies);
                }, error => reject(error));
            } else {
                reject(false);
            }
        });
    }


    /**
     * Load more comments.
     *
     * @params  {any} infiniteScroll
     * @return {void}
     */
    loadComments(infiniteScroll: any): void {
        this.infiniteScroll = infiniteScroll;

        this.moreComments().then(() => {
            infiniteScroll.complete();
        }, () => {
            this.allCommentsLoaded = true;
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
    refreshComments(refresher: any): void {
        this.getComments().then(() => {
            this.allCommentsLoaded = false;

            if (this.infiniteScroll) {
                this.infiniteScroll.enable(true);
            }

            refresher.complete();
        });
    }

    /**
     * Listener for created comments from service.
     *
     * @return {void}
     */
    onCommentCreated() {
        this.groupMessageService
            .observers['comment:created'].subscribe(comment => {
                if (comment.UserId != this.auth.user().UserId) {
                    this.comments.push(comment);
                }
            });
    }

    /**
     * Listener for deleted comments from service.
     *
     * @return {void}
     */
    onCommentDeleted() {
        this.groupMessageService
            .observers['comment:deleted'].subscribe(c => {
                let replies = this.comments
                    .filter((comment) => c.ChatId != comment.ChatId);

                this.comments = replies;
            });
    }

    /**
     * Listener for updated comments from service.
     *
     * @return {void}
     */
    onCommentUpdated() {
        this.groupMessageService
            .observers['comment:updated'].subscribe(comment => {
                let index = this.comments.findIndex(com => com.ChatId == comment.ChatId);

                this.comments[index] = comment;
            });
    }
}
