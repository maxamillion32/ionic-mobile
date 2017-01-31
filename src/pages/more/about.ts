import { Component } from '@angular/core';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'about-page',
    templateUrl: './about.html',
})
export class AboutPage {

    constructor(
        public analyticsService : AnalyticsService){}

    /**
     * Open a link.
     */
    openLink(link: string): void {
        window.open(link, '_system');
    }
}
