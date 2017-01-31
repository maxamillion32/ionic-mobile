import { ModalController } from 'ionic-angular';
import { VideoPage } from '../../pages/feed/video';
import { Component, Input } from '@angular/core';
import { SocialSharing } from 'ionic-native';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'next-week',
    templateUrl: './next-week.html',
})
export class NextWeekComponent {
    /**
     * The video of the component.
     *
     */
    @Input() video;

    /**
     * Next week's text
     */

    @Input() nextWeekText;

    /**
     * Constructor.
     *
     * @param  {ModalController} modalCtrl
     */
    constructor(public modalCtrl: ModalController,
                public analyticsService: AnalyticsService) {}

    /**
     * Open the video modal.
     *
     * @return {void}
     */
    openVideo(): void {
        let profileModal = this.modalCtrl.create(VideoPage, {
            video: this.video,
            showPublishDate: false
        });

        this.analyticsService.trackPageAction('Video', 'Page Enter', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        profileModal.present();
    }

    /**
     * Share video.
     *
     * @return void
     */
    share(): void {
        if (this.video.PermanentLink) {
            this.analyticsService.trackPageAction('Video', 'Video Shared', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
            SocialSharing.share(
                this.video.PostExcerpt,
                this.video.PostPostTitle,
                null,
                this.video.PermanentLink
            );
        }
    }
}
