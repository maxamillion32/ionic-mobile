import {
    GroupsMapComponent, SearchBarComponent, GroupsSearchResultsComponent
} from '../../components/groups';
import { Component, ViewChild } from '@angular/core';
import { ModalController, ViewController, NavParams } from 'ionic-angular';
import { BodyClass } from '../../services';
import { GroupService, AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'groups-page',
    templateUrl: './groups.html',
})
export class GroupsPage {
    /**
     * Search bar component.
     *
     * @return {GroupsMapComponent}
     */
    @ViewChild(SearchBarComponent) searchBar;

    /**
     * Search results component.
     *
     * @return {GroupsSearchResultsComponent}
     */
    @ViewChild(GroupsSearchResultsComponent) searchResults;

    /**
     * Maps component.
     *
     * @return {GroupsMapComponent}
     */
    @ViewChild(GroupsMapComponent) map;

    /**
     * The filter string.
     *
     * @type {string}
     */
    _filterString: string;

    /**
     * Constructor.
     */
    constructor(
        public bodyClass: BodyClass,
        public modal: ModalController,
        public view: ViewController,
        public params: NavParams,
        public groupService: GroupService,
        public analyticsService: AnalyticsService
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.filterString = this.searchBar.form.value;
    }

    /**
     * On view enter.
     */
    ionViewWillEnter() {
        this.searchBar.isSearching = false;

        if (this.groupService.getSearchFilters()) {
            this.updateFilters(this.groupService.getSearchFilters());
        }
    }

    /**
     * Get the filter string from selected filters.
     *
     * @param  {any} filters
     * @return {string}
     */
    get filterString(): string {
        return this._filterString;
    }

    set filterString(filters) {
        let filterString = [];
        let keys = {
            ChildcareAvailableIds: "Childcare",
            GroupFocusIds: "Topic",
            GroupMakeupIds: "Type",
            MeetingDayIds: "Days of Week",
        };

        Object.keys(filters).forEach(key => {
            if ((filters[key] && filters[key].length) && keys[key]) {
                
                if(filters[key].length == 0) return;

                let stringToPush = filters[key].length + ' ';
                
                if(key == "ChildcareAvailableIds" && !filters[key].includes(4)){
                    if(filters[key].length == 1){
                        stringToPush = stringToPush + keys[key] + ' Option';
                    } else{
                        stringToPush = stringToPush + keys[key] + ' Options';
                    }
                }

                if(key == "GroupFocusIds" || key == "GroupMakeupIds"){
                    if(filters[key].length == 1){
                        stringToPush = stringToPush + keys[key];
                    } else{
                        stringToPush = stringToPush + keys[key] + 's';
                    }
                }

                if(key == "MeetingDayIds"){
                    if(filters[key].length == 1){
                        stringToPush = stringToPush + 'Day of the Week';
                    } else{
                        stringToPush = stringToPush + 'Days of the Week';
                    }
                }

                filterString.push(stringToPush);
            }
        });

        this._filterString = filterString.join(', ') || 'No filters selected';
    }

    /**
     * Update the filters.
     *
     * @param  {any} filters
     * @return {void}
     */
    updateFilters(filters: any): void {
        this.filterString = filters;
        this.searchBar.updateFilters(filters);
        this.filterString = this.searchBar.form.value;
    }


/**
 * Get the amount of group results showing.
 * 
 * @param {SearchBarComponent} searchBar
 * @return {string}
 */
    getSearchShowingCount(searchBar : SearchBarComponent): string{
        if(!searchBar || !searchBar.results || searchBar.isSearching || searchBar.initializing) return 'Searching...';
        return 'Showing ' + searchBar.results.length + ' Groups';
    }

    /**
 * Get the amount of group results total.
 * 
 * @param {SearchBarComponent} searchBar
 * @return {number}
 */
    getSearchTotalCount(searchBar : SearchBarComponent): number{
        if(!searchBar || !searchBar.results || searchBar.isSearching) return 0;
        return searchBar.totalSearchResults;
    }
    

    /**
     * On View did enter.
     *
     * @return {void}
     */
    ionViewDidLeave(): void {
        this.bodyClass.remove('groups');
    }

    /**
     * On View will leaave.
     *
     * @return {void}
     */
    ionViewWillUnload(): void {
        this.bodyClass.remove('groups');
    }
}
