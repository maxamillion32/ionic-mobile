import {
    Component, Input, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import { ModalController } from 'ionic-angular';
import { VideoPage } from '../../pages/feed/video';
import { VideoService } from '../../services';
import { Event } from '@12stonechurch/ngkit-mobile';

@Component({
    selector: 'video-item',
    templateUrl: './video-item.html',
})
export class VideoItemComponent {
    /**
     * The video of the component.
     *
     */
    @Input() video;

    /**
     * Event emitter for opening a video.
     *
     * @return {EventEmitter<any>}
     */
    @Output() opening: EventEmitter<any> = new EventEmitter();

    /**
     * The active state of the video.
     *
     * @type {boolean}
     */
    active: boolean = false;

    /**
     * The component subscriptions.
     *
     * @type {Object}
     */
    subs: any = {}

    /**
     * Constructor.
     *
     * @param  {ModalController} modalCtrl
     */
    constructor(
        public videoService: VideoService,
        public event: Event,
        public cd: ChangeDetectorRef,
        public modalCtrl: ModalController
    ) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void { }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        Object.keys(this.subs).forEach((sub) => this.subs[sub].unsubscribe());
        this.subs = {};
    }

    /**
     * Open the video modal.
     *
     * @return {void}
     */
    openVideo(): void {
        let profileModal = this.modalCtrl.create(VideoPage, {
            video: this.video
        });

        this.opening.next(true);
        this.active = true;
        this.watchStopping();

        profileModal.present();
    }

    /**
     * Watch when videos stop.
     *
     * @return {void}
     */
    watchStopping(): void {
        this.subs['video:stopping'] = this.event.listen('video:stopping')
            .subscribe(() => {
                this.active = false;
                this.subs['video:stopping'].unsubscribe();
                this.cd.detectChanges();
            });
    }
}
