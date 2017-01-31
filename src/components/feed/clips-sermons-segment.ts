import { Component, Input } from '@angular/core';

@Component({
    selector: 'clips-sermons-segment',
    templateUrl: './clips-sermons-segment.html',
})
export class ClipsSermonsSegmentComponent {
    /**
     * The media type to display in the segment.
     *
     * @type {string}
     */
    mediaType: string = "clips";

    /**
     * The series of the component.
     */
    @Input() series;

    /**
     * On Component initiation
     */
    ngOnInit() {
        if (!this.series.VideoClips.length) {
            this.mediaType = "sermons";
        }
    }
}
