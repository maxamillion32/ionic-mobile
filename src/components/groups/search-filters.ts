import {
    Component, Input, OnInit, Output, EventEmitter
} from '@angular/core';
import { LookupService } from '@12stonechurch/12Stone-angular-mobile';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'search-filter',
    templateUrl: './search-filters.html'
})
export class SearchFiltersComponent implements OnInit {
    /**
     * The form of the filter.
     *
     * @return {any}
     */
    @Input() form: FormGroup;

    /**
     * Title of the filter.
     *
     * @return {string}
     */
    @Input() title: string;

    /**
     * Key of the data to retrieve from lookup service.
     *
     * @return {string}
     */
    @Input() key: string;

    /**
     * The type of filter.
     *
     * @return {string}
     */
    @Input() type: string = 'checkbox';

    /**
     * The identifier of the filter key.
     *
     * @return {string}
     */
    @Input() identifier: string;

    /**
     * Sorts the list.
     *
     * @return {string}
     */
    @Input() sort: boolean = false;

    /**
     * The event to emit when selections are made.
     * .
     * @return {EventEmitter}
     */
    @Output() toggle: EventEmitter<any> = new EventEmitter();

    /**
     * Filters of the componet.
     *
     * @type {any}
     */
    filters: any;

    /**
     * Constructor.
     *
     * @param  {LookupService} lookup
     * @param  {NavParams} params
     */
    constructor(public lookup: LookupService) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        if (this.key) {
            this.lookup.get(this.key).then(filters => {
                this.filters = filters.filter(filter => filter.Name != "");
                this.filters.map(filter => {
                    if (this.isChecked(filter)) {
                        filter.active = true
                    }
                });
            });
        }
    }

    /**
     * Toggle search filter on an off.
     *
     * @param  {Event} event
     * @param  {any} filter
     * @return {boolean}
     */
    toggleFilter(event, filter): boolean {
        if (this.type == 'checkbox') {
            filter.active = !filter.active;
        } else {
            let state = filter.active;
            this.filters.map(filter => filter.active = false);
            filter.active = !state;
        }

        this.emit();

        return false;
    }

    /**
     * Emit the the value of the dropdown.
     *
     * @return {void}
     */
    emit(): void {
        let value = this.filters
            .filter(filter => filter.active)
            .map(filter => filter.Value);

        if (this.type == 'radio') value = value[0] || null;

        this.toggle.emit({ [this.identifier]: value });
    }

    /**
     * Check if a value is checked.
     *
     * @param  {any} filter
     * @return {boolean}
     */
    isChecked(filter: any): boolean {
        if (this.form) {
            let value = this.form.controls[this.identifier].value;

            if (value) {
                return value.indexOf(filter.Value) >= 0;
            }
        }

        return false;
    }
}
