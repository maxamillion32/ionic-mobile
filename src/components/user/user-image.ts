import { Component, Input } from '@angular/core';

@Component({
    selector: 'user-image',
    templateUrl: './user-image.html'
})
export class UserImageComponent {
    /**
     * User object.
     *
     * @return {Object}
     */
    @Input() user: any;

    /**
     * Width of the image component.
     *
     * @return {string}
     */
    @Input() width: string = '75';

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
    get profileImage(): string {
        if (this.imageUrl) {
            return `url(${this.imageUrl})`;
        }

        if (this.user && this.user.Photos && this.user.Photos[this.imageSize]) {
            let profileImage = this.user.Photos[this.imageSize].ImageUrl;

            return `url(${profileImage})`;
        }

        return 'none';
    }

    set profileImage(image) { }
}
