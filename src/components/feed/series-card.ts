import { Component, Input } from '@angular/core';
import { SeriesPage } from '../../pages/feed/series';

@Component({
    selector: 'series-card',
    templateUrl: './series-card.html'
})
export class SeriesCardComponent {
    /**
     * Series page.
     */
    public seriesPage = SeriesPage;

    /**
     * The series of the component.
     *
     * @return {series}
     */
    @Input() series = null;

    /**
     * On component initiation.
     */
    ngOnInit() {
        this.sortMessages();
    }

    /**
     * Sorts The messages by date.
     *
     * @return {number}
     */
    sortMessages() {
        if (this.series && this.series.Messages.length > 1) {
            this.series.Messages.sort((a, b) => {
                let aDate = new Date(a.Date);
                let bDate = new Date(b.Date);
                if (aDate < bDate) return 1;
                if (aDate > bDate) return -1;
                return 0;
            });
        }
    }

    /**
     * Go to the series page.
     *
     * @return {any}
     */
    getNavParams(): any {
        if (this.series) {
            return { series: this.series };
        }

        return null;
    }
}
