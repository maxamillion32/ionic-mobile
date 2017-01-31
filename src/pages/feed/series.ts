import { Component } from '@angular/core';
import { FeedService } from '../../services';
import { NavParams } from 'ionic-angular';
import { SocialSharing } from 'ionic-native';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'series-page',
    templateUrl: './series.html',
})
export class SeriesPage {
    /**
     * The current series.
     *
     * @type {any}
     */
    series: any;

    /**
     * Constructor.
     *
     * @param  {NavParams} params
     */
    constructor(
        public feed: FeedService,
        public params: NavParams,
        public analyticsService: AnalyticsService
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        let series = this.params.get('series');

        if (series) {
            this.series = series;
        } else {
            alert('Error retreiving series.')
        }
    }

    /**
     * Share Series.
     *
     * @return void
     */
    share(): void {
        if (this.series) {
            this.analyticsService.trackPageAction('Series', 'Series Shared', {series: this.series});
            SocialSharing.share(
                this.series.Description,
                this.series.Name,
                null,
                this.series.SeriesUrl
            );
        }
    }
}
