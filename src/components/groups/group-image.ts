import { Component, Input } from '@angular/core';

@Component({
    selector: 'group-image',
    templateUrl: './group-image.html' 
})
export class GroupImageComponent {
    /**
     * User object.
     *
     * @return {Object}
     */
    @Input() group: any;

    /**
     * Width of the image component.
     *
     * @return {string}
     */
    @Input() width: string = '500';

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
    get groupImage(): string {
        if (this.imageUrl) {
            return `url(${this.imageUrl})`;
        }
        
        if (this.group && this.group.Photos && this.group.Photos[this.imageSize]) {
            let groupImage = this.group.Photos[this.imageSize].ImageUrl;

            return `url(${groupImage})`;
        }

        return 'none';
    }

    set groupImage(image) { }
}
