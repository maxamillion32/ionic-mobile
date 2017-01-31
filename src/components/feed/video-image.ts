import { Component, Input } from '@angular/core';

@Component({
    selector: 'video-image',
    templateUrl: './video-image.html'
})
export class VideoImageComponent {
    /**
     * Video object.
     *
     * @return {Object}
     */
    @Input() video: any;

    /**
     * Width.
     *
     * @type {string}
     */
    public _width: string = '';

    /**
     * Width of the image component.
     *
     * @return {string}
     */
    @Input()
    get width(): string {
        return this._width;
    };

    set width(width) {
        this._width = (width) ? width + 'px' : '';
    }

    /**
     * Size of the image to use in component.
     *
     * @return {string}
     */
    @Input() imageSize: string = 'Medium';

    /**
     * A specific image url to use.
     *
     * @return {string}
     */
    @Input() imageUrl: string = '';

    /**
     * On Init assign image.
     *
     * @return
     */
    get videoImage(): string {
        if (this.imageUrl) {
            return `url(${this.imageUrl})`;
        }

        if (this.video && this.video.Photos && this.video.Photos[this.imageSize]) {
            let videoImage = this.video.Photos[this.imageSize].ImageUrl;

            return `url(${videoImage})`;
        }

        return 'none';
    }

    set videoImage(image) { }
}
