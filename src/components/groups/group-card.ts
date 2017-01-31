import { Component, OnInit, Input } from '@angular/core';
import { GroupPage } from '../../pages/groups';
import { Authentication } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'group-card',
    templateUrl: './group-card.html',
})
export class GroupCardComponent implements OnInit {
    /**
     * Group of the component.
     *
     * @return {any}
     */
    @Input() group: any;

    /**
     * Page to push to.
     */
    pushPage;

    /**
     * Params to send to the group component.
     *
     * @type {any}
     */
    params: any;

    /**
     * Constructor.
     *
     * @param {GroupService} groupService
     */
    constructor(public auth: Authentication) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.pushPage = GroupPage;

        this.params = {
            group_id: this.group.GroupId
        }
    }
}
