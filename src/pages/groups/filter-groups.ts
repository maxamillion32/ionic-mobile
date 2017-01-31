import { FormGroup, FormControl } from '@angular/forms';
import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'filter-groups-page',
    templateUrl: './filter-groups.html',
})
export class FilterGroupsPage {
    /**
     * The form used to update the user.
     *
     * @type {FormGroup}
     */
    form: FormGroup;

    /**
     * Applied filters to search.
     *
     * @type {any}
     */
    appliedFilters: any = null;

    /**
     * The ready state of the component.
     *
     * @type {boolean}
     */
    ready: boolean = false;

    /**
     * Constructor.
     *
     * @param  {ViewController} nav
     * @param  {NavParams} params
     */
    constructor(
        public view: ViewController,
        public params: NavParams,
        public analyticsService: AnalyticsService
    ) {
        this.form = new FormGroup({
            CampusIds: new FormControl(null),
            ChildcareAvailableIds: new FormControl(null),
            GenderIds: new FormControl(null),
            GroupFocusIds: new FormControl(null),
            GroupMakeupIds: new FormControl(null),
            GroupTypeIds: new FormControl(null),
            MeetingDayIds: new FormControl(null),
            MeetingFrequencyIds: new FormControl(null),
            SchoolIds: new FormControl(''),
        });
    }

    /**
     * On view did enter.
     *
     * @return {void}
     */
    ionViewDidEnter(): void {
        this.appliedFilters = this.params.get('filters');

        this.updateFilters(this.appliedFilters);

        this.ready = true;
    }

    /**
     * Update a filter values.
     *
     * @param {any} value
     * @return {void}
     */
    updateFilter(value: any): void {
        let key = Object.keys(value)[0];

        this.form.controls[key].setValue(value[key]);
    }

    /**
     * Update the values of all filters.
     *
     * @param {any} value
     * @return {void}
     */
    updateFilters(filters: any): void {
        Object.keys(filters).forEach(filter => {
            if (this.form.controls[filter]) {
                this.form.controls[filter].setValue(filters[filter]);
            }
        });
    }

    /**
     * Apply the search filter.
     *
     * @return {void}
     */
    apply(): void {
        this.view.dismiss(this.form.value);
    }
}
