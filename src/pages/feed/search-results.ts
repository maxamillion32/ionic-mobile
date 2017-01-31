import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { FeedService } from '../../services';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'search-results-page',
    templateUrl: './search-results.html',
})
export class SearchResultsPage {
    /**
     * The results of a component.
     *
     * @type {any}
     */
    results: any;

    /**
     * Search pagination meta.
     *
     * @type {any}
     */
    searchMeta: any;

    /**
     * The string search query.
     *
     * @type {string}
     */
    searchQuery: string;

    /**
     * State of all results being loaded.
     *
     * @type {boolean}
     */
    allResultsLoaded: boolean;

    /**
     * The loading state of the component.
     *
     * @type {boolean}
     */
    loading: boolean;

    /**
     * Constructor.
     *
     * @param  {NavParams}   params
     * @param  {FeedService} feed
     */
    constructor(
        public params: NavParams,
        public feed: FeedService,
        public analytics: AnalyticsService
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.loading = true;
        this.searchQuery = this.params.get('search');
    }

    /**
     * On the view loaded.
     *
     * @return {void}
     */
    ionViewDidLoad(): void {
        setTimeout(() => {
            this.search();
        }, 300)
    }

    /**
     * Start a search.
     *
     * @return {void}
     */
    search(): void {
        this.feed.search({
            SearchQuery: this.searchQuery
        }, { Limit: 25 }).subscribe(res => {
            this.searchMeta = res;
            this.results = res.Results;
            this.loading = false;

            this.analytics.trackPageAction('Feed', 'Feed Search', {
                SearchQuery: this.searchQuery,
                Results: res.TotalRecordCount
            });
        });
    }

    /**
     * Load more results.
     *
     * @param {any} infiniteScroll [description]
     */
    moreResults(infiniteScroll: any): void {
        if (this.searchMeta.NextPageNumber) {
            this.feed.search({
                SearchQuery: this.searchQuery
            }, {
                    Limit: this.searchMeta.Limit,
                    Page: this.searchMeta.NextPageNumber,
                }).subscribe(res => {
                    infiniteScroll.complete();
                    this.searchMeta = res;
                    this.results = this.results.concat(res.Results);
                }, error => {
                    this.allResultsLoaded = true;
                    infiniteScroll.enable(false);
                    infiniteScroll.complete();
                });
        } else {
            this.allResultsLoaded = true;
            infiniteScroll.enable(false);
            infiniteScroll.complete();
        }
    }
}
