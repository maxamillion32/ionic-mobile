import { GroupService, GroupSearchModel, AnalyticsService, ApiMessageModel } from '@12stonechurch/12Stone-angular-mobile';
import { FormGroup, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { Keyboard } from 'ionic-native';
import { MapService } from '../../services';
import { AlertController } from 'ionic-angular';


@Component({
    selector: 'groups-search-bar',
    templateUrl: './search-bar.html'
})
export class SearchBarComponent {
    /**
     * Search results.
     *
     * @type {any}
     */
    results: any = null;

    /**
     * Total search result count.
     * 
     * @type{number}
     * 
     */
    totalSearchResults: number = 0;

    /**
     * Form of the componet.
     *
     * @tpye {FormGroup}
     */
    form: FormGroup;

    /**
     * Layout of the group list.
     *
     * @type {string}
     */
    layout: string = 'map';

    /**
     * Location services available.
     * 
     * @type {boolean}
     */
    locationAvailable: boolean = false;

    /**
     * The searching state of the component.
     *
     * @type {boolean}
     */
    isSearching: boolean = false;

    /**
     * Whether or not the screen is initializing.
     * 
     * @type{boolean}
     * 
     */
    initializing: boolean = true;

    /**
     * The current map boundaries
     * 
     * @type{any}
     */
    mapBounds : any = {};

    /**
     * Whether or not to show "Search This Area"
     * 
     * @type{boolean}
     */
    showSearchArea: boolean = false;

    /**
     * The search subscription.
     *
     * @type {Subscription}
     */
    subs = {};

    /**
     * Constuructor.
     */
    constructor(
        public groupService: GroupService,
        public mapService: MapService,
        public analytics: AnalyticsService,
        public alertCtrl: AlertController
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
            MaxLatitude: new FormControl(''),
            MaxLongitude: new FormControl(''),
            MinLatitude: new FormControl(''),
            MinLongitude: new FormControl(''),
            SearchString: new FormControl(''),
        });

        if (this.mapService.groups) {
            this.results = this.mapService.groups;
        }
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        
        this.subs['map:ready'] = this.mapService.ready
            .subscribe(() => {
                if(this.mapService.userLocation != null){
                    this.locationAvailable = true;
                    this.myLocation(new MouseEvent('initialize'));
                } else {
                    this.locationAvailable = false;
                    this.search();
                }
            });

        this.subs['map:camera_change'] = this.mapService.cameraChange
            .subscribe(event => {

                this.mapService.markerIndex.emit(null);
                this.mapService.getBounds().then(bounds => {
                    this.mapBounds = {
                        MaxLatitude: bounds._ne.lat,
                        MaxLongitude: bounds._ne.lng,
                        MinLatitude: bounds._sw.lat,
                        MinLongitude: bounds._sw.lng,
                    }
                });

                if(!this.initializing){
                    //this.showSearchArea = true;
                    this.search();
                }
            });
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        Object.keys(this.subs).forEach(sub => this.subs[sub].unsubscribe());
        this.subs = {};
    }

    /**
     * Event for typing in the search field.
     *
     * @param  {Event} event
     * @return {void}
     */
    onType(event) {
        if (event.target.value.length >= 3) {
            this.search();
        }    
    }

    /**
     * Clear the search (used for ionClear)
     * 
     * @return{void}
     */

    clearSearch():void{
        this.form.controls['SearchString'].setValue('');
        this.search();
    }

    /**
     * Search for groups.
     *
     * @param {number} count
     */
    search(): void {

        Keyboard.close();
        this.isSearching = true;
        this.results = null;
        this.mapService.groups = this.results;
        this.mapService.markerIndex.emit(null);
        
        let searchInput = this.form.value;

        if (this.layout == 'map') {
            searchInput = Object.assign(searchInput, this.mapBounds);
            this.submitSearch(searchInput);
        } else {
            this.submitSearch(searchInput);
        }
    }

    /**
     * Submit search based on input.
     *
     * @param  {any} searchInput
     * @return {void}
     */
    submitSearch(searchInput: any): void {
        searchInput = new GroupSearchModel(searchInput);

        this.groupService.searchGroups(searchInput, {
            Limit: 100
        }).subscribe(res => {

            if(res.Results.length === 0){
                this.showNoResultsMessage();
            }

            setTimeout(()=> {
                this.results = res.Results;
                this.mapService.groups = this.results;
                this.totalSearchResults = res.TotalRecordCount;

                setTimeout(()=>{
                    this.isSearching = false;
                    this.initializing = false;
                    this.showSearchArea = false;
                }, 500);
            }, 500);

            this.analytics.trackPageAction('Groups', 'Group Search', {
                SearchQuery: searchInput,
                Results: res.TotalRecordCount
            });
        });      
    }

    /**
     * Get the message for "No Search Results"
     */

    showNoResultsMessage(): void{
        this.groupService.getNoGroupsMessage().then((res:ApiMessageModel)=>{

                let confirmAlert = this.alertCtrl.create({
                    title: 'Whoops!',
                    message: res.message,
                    buttons: [{
                        text: 'OK',
                        role: 'cancel'
                    }]
                });
                confirmAlert.present();

        }, error => console.error(error));
    }

    /**
     * Update filters by updating the form values.
     *
     * @param {any} filters
     * @return {void}
     */
    updateFilters(filters: any): void {
        Object.keys(filters).forEach(filter => {
            this.form.controls[filter].setValue(filters[filter])
        });

        this.groupService.setSearchFilters(filters);

        this.search();
    }

    /**
     * Fix the map to the user's location and search.
     *
     * @return {void}
     */
    myLocation(event: MouseEvent): void {
        if(event.type == 'click' && event.screenX == 0 && event.screenY == 0){
            return;
        }
        
        this.mapService.moveToUser().then(() => {
            this.search();
        }, error => console.error(error));
    }
}
