import { AudioService, BodyClass } from '../../services';
import { NavParams, ModalController, ViewController } from 'ionic-angular';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { StatusBar } from 'ionic-native';
import { VideoPage } from './video';
import { Event } from '@12stonechurch/ngkit-mobile';
import { SocialSharing } from 'ionic-native';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'audio-page',
    templateUrl: './audio.html',
})
export class AudioPage {
    /**
     * The video of the component.
     *
     * @type {any}
     */
    video: any;

    /**
     * The audio player element.
     */
    @ViewChild('audioElement') audioElement;

    /**
     * Interval to check the current time.
     *
     * @type {any}
     */
    timeInterval: any;

    /**
     * The minimized state of the component.
     *
     * @type {boolean}
     */
    minimized: boolean = false;

    /**
     * The modal HTML element.
     *
     * @type {Element}
     */
    modalElement: HTMLElement;

    /**
     * Component subscriptions.
     *
     * @type {any}
     */
    subscriptions: any[] = [];

    /**
     * Constructor.
     *
     * @param  {NavParams} params
     */
    constructor(
        public element: ElementRef,
        public params: NavParams,
        public event: Event,
        public bodyClass: BodyClass,
        public audioService: AudioService,
        public modalCtrl: ModalController,
        public viewCtrl: ViewController,
        public analyticsService: AnalyticsService
    ) {
        if (window['cordova']) {
            StatusBar.styleLightContent();
        }
        this.video = this.params.get('video');
    }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        if (window['cordova']) {
            StatusBar.styleLightContent();
        }

        this.initAudio();
        this.bodyClass.add('media-page');

        this.subscriptions['videoPlaying'] = this.event.listen('video:playing')
            .subscribe(video => {
                if (video) {
                    this.viewCtrl.dismiss();
                }
            });
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        if (window['cordova']) {
            StatusBar.styleDefault();
        }

        this.bodyClass.remove('media-page');
        this.audioService.destroy();
        this.unsubscribe();
    }

    ionViewDidEnter(){
        this.analyticsService.trackPageAction('Audio', 'Page Enter', {audio: this.audioElement.nativeElement.children[0].src});
    }

    /**
     * Close the video.
     *
     * @return {void}
     */
    close(): void {
        this.modalElement.classList.remove('active-player');
        this.unsubscribe();
        setTimeout(() => this.viewCtrl.dismiss(), 100);
    }

    /**
     * Unsubscribe from subscriptions.
     *
     * @return {void}
     */
    unsubscribe(): void {
        clearInterval(this.timeInterval);
        Object.keys(this.subscriptions)
            .forEach(k => this.subscriptions[k].unsubscribe());
    }

    /**
     * Init the audio service.
     */
    initAudio(): void {
        this.audioService.init(this.audioElement, this.video).then(() => {
            this.audioService.play();
            this.modalElement.classList.add('active-player');
            this.timeInterval = setInterval(() => { }, 500);
            this.analyticsService.trackPageAction('Audio', 'Play Audio', { audio: this.audioElement.nativeElement.children[0].src});
            

            this.subscriptions['audioInit'] = this.event.listen('audio:init')
                .subscribe(audio => {

                    if (audio.Id != this.video.Id) {
                        this.analyticsService.trackPageAction('Audio', 'Pause Audio', {audio: this.audioElement.nativeElement.children[0].src});
            
                        this.modalElement.classList.remove('active-player');
                        this.audioService.pause();
                        this.destroy();
                    }
                });
        }, error => alert(error));

        this.modalElement = this.element.nativeElement.parentElement.parentElement;
    }

    /**
     * Open the video player.
     *
     * @return {void}
     */
    openVideo(): void {
        this.modalElement.classList.remove('active-player');
        this.audioService.destroy();

        let modal = this.modalCtrl.create(VideoPage, {
            video: this.video
        });

        modal.present().then(() => {
            this.viewCtrl.dismiss()
        });
    }

    /**
     * Toggle the minimized state of the video modal.
     *
     * @return {void}
     */
    toggleMinimize(): boolean {
        setTimeout(() => {
            this.minimized = !this.minimized;

            if (this.minimized) {
                this.modalElement.style.transition = 'top 200ms ease-out';
                this.modalElement.style.top = '100%';
                this.modalElement.classList.add('minimized');
                this.bodyClass.add('background-audio-playing');

            }
            if (!this.minimized) {
                this.modalElement.style.transition = 'top 200ms ease-in';
                this.modalElement.style.top = '0%';
                this.modalElement.classList.remove('minimized');
                this.bodyClass.remove('background-audio-playing');
            }
        }, 100);

        return false;
    }

    /**
     * Destroy the current audio player.
     */
    destroy(): void {
        this.audioService.destroy();
        this.modalElement.remove();
    }

    /**
     * Share video.
     *
     * @return void
     */
    share(): void {
        if (this.video.PermanentLink) {
            this.analyticsService.trackPageAction('Audio', 'Audio Shared', {audio: this.audioElement.nativeElement.children[0].src});
            SocialSharing.share(
                this.video.PostExcerpt,
                this.video.PostPostTitle,
                null,
                this.video.PermanentLink
            );
        }
    }
}
