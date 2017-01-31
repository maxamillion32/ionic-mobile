import { SearchResultsPage } from './search-results';
import { NavController, ModalController, InfiniteScroll } from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { BodyClass, FeedService, SystemService } from '../../services';
import { VideoModel, AnalyticsService, LookupService, MinistryPlatformSettingModel } from '@12stonechurch/12Stone-angular-mobile';
import { Component, ViewChild } from '@angular/core';
import { Event } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'feed-page',
    templateUrl: './feed.html',
})
export class FeedPage {

    /**
     * 
     * Initialized
     */
    initialized: boolean = false;

    /**
     * The feed search query.
     *
     * @type {string}
     */
    searchQuery: string = '';

    /**
     * Infinite scroll element.
     */
    @ViewChild(InfiniteScroll) infiniteScroll;

    /**
     * Feed search component.
     */
    @ViewChild('feedSearch') feedSearch;

    /**
     * State of searching in the feed.
     *
     * @type {boolean}
     */
    searching: boolean = false;

    /**
     * State of searching transition on the feed.
     *
     * @type {boolean}
     */
    isSearchingTransition: boolean = false;

    /**
     * The series of the feed.
     *
     * @type {any}
     */
    series: any;

    /**
     * Series pagination meta.
     *
     * @type {any}
     */
    seriesMeta: any;

    /**
     * State of all series being loaded.
     *
     * @type {boolean}
     */
    allSeriesLoaded: boolean = false;

    /**
     * The next week video on the feed.
     *
     * @type {any}
     */
    nextWeekVideo: any;

    /**
     * The next week text.
     * 
     * @type {string}
     */
    nextWeekText: string;

    /**
     * The latest message on the feed.
     *
     * @type {any}
     */
    latestMessage: any;

    /**
     * Constructor.
     *
     * @param  {NavController} nav
     */
    constructor(
        public bodyClass: BodyClass,
        public feed: FeedService,
        public system: SystemService,
        public modalCtrl: ModalController,
        public nav: NavController,
        public analyticsService: AnalyticsService,
        public lookupService: LookupService,
        public event: Event
    ) { }

    /**
     * On the view loaded.
     *
     * @return {void}
     */
    ionViewDidEnter() {
        if(!this.initialized){
            this.init();
            this.initialized = true;
        }
    }

    /**
     * Initialize the component.
     *
     * @return {void}
     */
    init() {
        this.getSeries();
        this.getlatestMessage();
        this.getNextWeekVideo();
        this.feedSearch.getTags();
    }

    /**
     * Return the latest message.
     *
     * @return {void}
     */
    getlatestMessage(): void {
        this.feed.listMessages({
            Limit: 1
        }).then(res => {
            this.latestMessage = new VideoModel(res.Results[0]);
        });
    }

    /**
     * Get series.
     *
     * @return {void}
     */
    getSeries(): Promise<any> {

        return new Promise((resolve, reject) => {
            this.feed.listSeries({
                IncludeMessages: true,
                Limit: 5,
                Sort: 'SeriesPublishedDate|desc'
            }).then(res => {
                this.seriesMeta = res;
                this.series = res.Results;
                resolve(this.series);
            }, (error) => reject(error));
        });
    }

    /**
     * Get series.
     *
     * @return {Promise<any>}
     */
    moreSeries(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.seriesMeta.NextPageNumber) {
                this.feed.listSeries({
                    Limit: this.seriesMeta.Limit,
                    Page: this.seriesMeta.NextPageNumber,
                    IncludeMessages: true,
                    Sort: 'SeriesPublishedDate|desc'
                }).then(res => {
                    this.seriesMeta = res;
                    this.series = this.series.concat(res.Results);
                    resolve(this.series);
                }, error => reject(error));
            } else {
                reject(false);
            }
        });
    }

    /**
     * Load more series.
     *
     * @params  {any} infiniteScroll
     * @return {void}
     */
    loadSeries(infiniteScroll: any): void {
        this.moreSeries().then(() => {
            infiniteScroll.complete();
        }, () => {
            this.allSeriesLoaded = true;
            infiniteScroll.enable(false);
            infiniteScroll.complete();
        });
    }

    /**
     * Refresh series with pull to refresh.
     *
     * @param  {any} refresher
     * @return {void}
     */
    refreshSeries(refresher: any): void {
        this.analyticsService.trackPageAction('Feed', 'Refresh Feed');
       
        this.getlatestMessage();
        this.getNextWeekVideo();
        
        this.getSeries().then(() => {
            this.allSeriesLoaded = false;
            this.infiniteScroll.enable(true);
            refresher.complete();
        }, (error) => {
            this.infiniteScroll.enable(true);
            refresher.complete();
        });
    }

    /**
     * Change the is searching state.
     *
     * @param  {boolean} searching
     * @return {void}
     */
    isSearching(searching: boolean): void {
        this.searching = searching;

        if (!searching) {
            Keyboard.close();
            this.isSearchingTransition = true;
            setTimeout(() => this.isSearchingTransition = false);
        }
    }

    /**
     * Return the next week video.
     *
     * @return {void}
     */
    getNextWeekVideo(): void {
        this.feed.getVideos({
            Type: "preview",
            Limit: 1
        }).then(res => {
            this.nextWeekVideo = new VideoModel(res.Results[0].RowData);
        });

        this.lookupService.getSetting("AppFeedComingSoon").then((res: MinistryPlatformSettingModel)=>{        
            this.nextWeekText = res.Value;
        });
    }

    /**
     * Perform a search.
     *
     * @param  {string} query
     * @return {void}
     */
    search(query): void {
        this.nav.push(SearchResultsPage, {
            search: query
        });
    }
}
