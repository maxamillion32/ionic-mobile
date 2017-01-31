import { FilterGroupsPage } from '../../pages/groups/filter-groups';
import {
    Component, Input, Output, EventEmitter, ViewChild
} from '@angular/core';
import { Slides, ModalController } from 'ionic-angular';
import { MapService } from '../../services';

@Component({
    selector: 'group-search-results',
    templateUrl: './search-results.html'
})
export class GroupsSearchResultsComponent {
    /**
     * Layout of the results.
     *
     * @type {string}
     */
    @Input() layout: string;

    /**
     * Layout of the results.
     *
     * @type {any}
     */
    @Input() groups: any;

    /**
     * Filter results.
     *
     * @type {any}
     */
    @Input() filterResults: {};

    /**
     * The slides component.
     *
     * @type {Slides}
     */
    @ViewChild('slider') slider: Slides;

    /**
     * The searchbar filters.
     *
     * @type {any}
     */
    @Input() filters: any;

    /**
     * Slider changed event.
     *
     * @return {EventEmitter<any>}
     */
    @Output() sliderChanged: EventEmitter<any> = new EventEmitter();

    /**
     * Filters updated event.
     *
     * @return {EventEmitter<any>}
     */
    @Output() filtersUpdated: EventEmitter<any> = new EventEmitter();

    /**
     * The loading state of the map results.
     *
     * @type {boolean}
     */
    @Input() resultsLoading: boolean = false;

    /**
     * The active index of the slides.
     *
     * @type {number}
     */
    slideIndex: number = null;

    /**
     * The component subscriptions.
     *
     * @type {Object}
     */
    subs: any = {}

    /**
     * Options for the slider.
     *
     * @type {Object}
     */
    slideOptions = {
        // longSwipesRatio: .10,
        // freeModeMomentumRatio: 2,
        // freeModeMinimumVelocity: 1
    }

    /**
     * Constructor.
     *
     * @param  {ModalController} modal
     * @param  {MapService} mapService
     */
    constructor(
        public modal: ModalController,
        public mapService: MapService
    ) {
        this.subs['markerIndex'] = this.mapService
            .markerIndex.subscribe(index => {
                this.setIndex(index).then(index => this.slideTo(index));
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
     * Set the index of the slider.
     *
     * @param  {number} index
     * @return {Promise<any>}
     */
    setIndex(index: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.slideIndex = index;
            resolve(this.slideIndex);
        });
    }

    /**
     * Emit a slide event.
     *
     * @return {void}
     */
    slideEvent(event): void {
        this.slideIndex = this.slider.getActiveIndex();
        this.sliderChanged.emit(this.groups[this.slideIndex].GroupId);
    }

    /**
     * Slide to an index in the results.
     *
     * @param  {number} index
     * @return {void}
     */
    slideTo(index: number): void {
        if (index || index === 0) {
            if (this.slider) {
                this.slider.slideTo(index, 300, false);
            } else {
                setTimeout(() => {
                    if (this.slider) {
                        this.slider.slideTo(index, 300, false)
                    }
                }, 1000);
            }
        }
    }

    /**
     * Opent the filters modal.
     *
     * @return {void}
     */
    openFilters(): void {
        let modal = this.modal.create(FilterGroupsPage, { filters: this.filters });

        modal.present();

        modal.onDidDismiss(filters => {
            this.filtersUpdated.emit(filters);
        });
    }
}
