import {
    NavController, NavParams, LoadingController, ViewController
} from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import {
    GroupMessageService, GroupModel, GroupMessageModel, AnalyticsService
} from '@12stonechurch/12Stone-angular-mobile';
import { FormGroup, FormControl } from '@angular/forms';
import Quill from 'quill';

@Component({
    selector: 'group-message-form',
    templateUrl: './group-message-form.html'
})
export class GroupMessageFormPage {
    /**
     * The group of the component.
     */
    group: GroupModel;

    /**
     * The message of the component.
     *
     * @return {FormGroup}
     */
    message: GroupMessageModel;

    /**
     * The form of the component.
     *
     * @return {FormGroup}
     */
    form: FormGroup;

    /**
     * Editor of the form.
     *
     * @type {Quill}
     */
    @ViewChild('editor') editor;

    /**
     * Quill text editor.
     *
     * @type {any}
     */
    quill: any;

    /**
     * Constructor.
     *
     * @param  {MessageService} messageService
     */
    constructor(
        public messageService: GroupMessageService,
        public nav: NavController,
        public view: ViewController,
        public params: NavParams,
        public loading: LoadingController,
        public analytics: AnalyticsService
    ) {
        this.group = this.params.get('group');
        this.message = this.params.get('message');

        this.form = new FormGroup({
            'Title': new FormControl(this.message ? this.message.Title : ''),
            'Body': new FormControl(this.message ? this.message.Body : ''),
            'UserMentions': new FormControl(this.message ? this.message.UserMentions : [])
        });
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngAfterViewInit(): void {
        this.quill = new Quill(this.editor.nativeElement, {
            modules: { toolbar: '#toolbar' },
            theme: 'snow',
            placeholder: 'Type your message here..'
        });

        if (this.message) {
            this.quill.pasteHTML(0, this.message.Body);
        }

        this.quill.on('text-change', () => {
            let content = this.editor.nativeElement
                .querySelector('.ql-editor').innerHTML;

            this.form.controls['Body'].setValue(content);
        });
    }

    /**
     * Submit the message to the group.
     *
     * @return {void}
     */
    submit(): void {
        let loader = this.loading.create({ content: 'Preparing Message...' });
        loader.present();

        let submit = (this.message) ? this.update() : this.post();

        submit.then(res => {
            loader.dismiss().then(() => {
                this.nav.pop();
            });
        }, error => {
            loader.dismiss();
            alert('Error sending message.')
        });
    }

    /**
     * Post the message to create a new message.
     *
     * @return {Promise<any>}
     */
    post(): Promise<any> {
        this.analytics.trackPageAction('Group Message Form', 'Post Group Message', {
            groupId: this.group.GroupId,
            message: this.form.value
        });

        return this.messageService.postMessage(this.group.GroupId, this.form.value);
    }

    /**
     * Update the message.
     *
     * @return {Promise<any>}
     */
    update(): Promise<any> {

        return this.messageService
            .updateMessage(this.group.GroupId, this.message.ChatId, this.form.value);
    }
}
