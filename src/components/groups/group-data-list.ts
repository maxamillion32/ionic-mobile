import { Component, Input } from '@angular/core';
import { GroupModel } from '@12stonechurch/12Stone-angular-mobile';
import * as moment from 'moment';

@Component({
    selector: 'group-data-list',
    templateUrl: 'group-data-list.html' 
})

export class GroupDataListComponent {
    /**
     * The group of the component.
     *
     * @return {GroupModel}
     */
    @Input() group: GroupModel;

    getFirstMeetingDate(){
        return moment(this.group.FirstMeetingDate).format("MMMM Do");
    }
}
