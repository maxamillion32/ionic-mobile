import { Component, Output, EventEmitter } from '@angular/core';
import { FeedService } from '../../services';

@Component({
    selector: 'feed-search',
    templateUrl: './search.html'
})
export class FeedSearchComponent {
    /**
     * Tag categories for searching.
     */
    tagCategories = [];

    /**
     * The loading state of the component.
     *
     * @type {boolean}
     */
    loading: boolean = false;

    /**
     * Tag selected event emitter.
     */
    @Output() tagSelected: EventEmitter<any> = new EventEmitter();

    /**
     * Constructor.
     *
     * @param  {NavController} nav
     */
    constructor(public feed: FeedService) { }

    /**
     * Gets the search tags from the api.
     */
    getTags(): void {
        this.loading = true;

        this.feed.getSearchTags().then(res => {
            this.tagCategories = res;
            this.loading = false;
        }, error => console.log(error.message));
    }

    /**
     * Search a tag.
     *
     * @param  {string} tag
     * @return {void}
     */
    selectTag(tag: string): void {
        this.tagSelected.emit(tag);
    }
}
