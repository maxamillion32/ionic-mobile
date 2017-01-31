import {
    Component, ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import {
    ModalController, ViewController, Content, NavParams, NavController, Platform
} from 'ionic-angular';
import { SocialSharing, StatusBar, InAppBrowser } from 'ionic-native';
import { VideoService, BodyClass, FeedService } from '../../services';
import { AudioPage } from './audio';
import { Event } from '@12stonechurch/ngkit-mobile';
import { AnalyticsService } from '@12stonechurch/12Stone-angular-mobile';

@Component({
    selector: 'video-page',
    templateUrl: './video.html',
})
export class VideoPage {
    /**
     * The current video.
     *
     * @type {any}
     */
    video: any;
    /**
     * Show the publish date.
     * 
     * @type { boolean }
     * 
     */
    showPublishDate: boolean = true;
    /**
     * The current video.
     *
     * @type {any}
     */
    curVideo: any;

    /**
     * The modal HTML element.
     *
     * @type {Element}
     */
    modalElement: HTMLElement;

    /**
     * The fullscreen state of the component.
     *
     * @type {any}
     */
    fullScreen: any = false;

    /**
     * If the fullscreen state was toggled.
     *
     * @type {boolean}
     */
    fullScreenToggled: boolean = false;

    /**
     * The minimized state of the component.
     *
     * @type {boolean}
     */
    minimized: boolean = false;

    /**
     * The fixed state of the video.
     *
     * @type {boolean}
     */
    videoFixed: boolean = false;

    /**
     * The touched state of the video.
     *
     * @type {boolean}
     */
    videoTouched: boolean = false;

    /**
     * The touching state of the video.
     *
     * @type {boolean}
     */
    videoTouching: boolean = false;

    /**
     * Video touched timeout.
     *
     * @type {any}
     */
    videoTouchedTimeout: any = null;

    /**
     * Vide Touching timeout.
     *
     * @type {Function}
     */
    videoTouchingTimeout: any = null;

    /**
     * The component subsriptions.
     *
     * @type {any}
     */
    subs: any = {};

    /**
     * The loading state of the component.
     *
     * @type {boolean}
     */
    loading: boolean;

    /**
     * The done state of the component.
     *
     * @type {boolean}
     */
    done: boolean = false;

    /**
     * Is Apple Platform
     * 
     * @type{boolean}
     */
    isApple: boolean = true;

    /**
     * The header element.
     */
    @ViewChild('toolbar') toolbar;

    /**
   * The content element.
   */
    @ViewChild(Content) content: Content;

    /**
     * The video element.
     */
    @ViewChild('videoElement') videoElement;

    /**
     * Constructor.
     *
     * @param  {ViewController} viewCtrl
     * @param  {VideoService} videoService
     */
    constructor(
        public bodyClass: BodyClass,
        public element: ElementRef,
        public nav: NavController,
        public event: Event,
        public feed: FeedService,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public params: NavParams,
        public videoService: VideoService,
        public cd: ChangeDetectorRef,
        public platform: Platform,
        public analyticsService: AnalyticsService
    ) {
        this.isApple = platform.is('ios');
     }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void {
        this.video = this.params.get('video');

        if(this.params.get('showPublishDate') !== undefined){
            this.showPublishDate = this.params.get('showPublishDate');
        }

        this.initVideo();
        this.setVideoClips();
    }

    ionViewDidEnter(){
        this.analyticsService.trackPageAction('Video', 'Page Enter', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
    }

    /**
     * Initialize the video player.
     *
     * @return {void}
     */
    initVideo(): void {
        if (!this.video) return;

        this.videoService.init(this.videoElement, this.video).then(() => {
            setTimeout(() => { }, 300);
        }, error => alert(error));

        this.subs['video:playing'] = this.event.listen('video:playing')
            .subscribe(video_id => {
                this.analyticsService.trackPageAction('Video', 'Video Playing', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
                
                if (video_id == this.video.Id) {
                    console.log("now playing");
                    this.modalElement.classList.add('active-player');
                } else if (video_id != this.video.Id) {
                    this.modalElement.classList.remove('active-player');
                    //this.pause();
                    this.loading = true;
                    //this.close();
                }
            });

        this.subs['video:paused'] = this.event.listen('video:paused')
            .subscribe(video_id => {

                this.analyticsService.trackPageAction('Video', 'Video Paused', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });

                if (video_id == this.video.Id) {
                    console.log("paused");
                    this.playing = false;
                }
            });

        this.subs['video:stopping'] = this.event.listen('video:stopping')
            .subscribe(video_id => {
                
                this.analyticsService.trackPageAction('Video', 'Video Stopping', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });

                if (video_id == this.video.Id) {
                    console.log("stopped");
                    this.playing = false;
                    this.done = true;
                }
            });
            
        this.modalElement = this.element.nativeElement.parentElement.parentElement;
    }

    /**
     * After the ionic view has fully loaded.
     *
     * @return {void}
     */
    ionViewDidLoad(): void {
        
        if (window['cordova']) {
            StatusBar.hide();
        }

        this.bodyClass.add('media-page');

        this.subs['audioPlaying'] = this.event.listen('audio:init')
            .subscribe(audio => {
                if (audio && this.videoService.playing) {
                    setTimeout(() => this.destroy(), 500);
                }
            });
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        if (window['cordova'] && !this.loading) {
            StatusBar.show();
        }

        this.bodyClass.remove('media-page');
        this.videoService.destroy();
        this.unsubscribe();
    }

    /**
     * Close the video.
     *
     * @return {void}
     */
    close(): void {
        this.pause();
        this.videoService.video.currentTime = 0;
        this.modalElement.classList.remove('active-player');
        this.viewCtrl.dismiss();
    }

    /**
     * Unsubscribe from subscriptions.
     *
     * @return {void}
     */
    unsubscribe(): void {
        Object.keys(this.subs).forEach(sub => this.subs[sub].unsubscribe());
        this.subs = {};
    }

    /**
     * Assign the wistia async id.
     *
     * @return {string}
     */
    wistiaAsyncId(): string {
        return `wistia_async_${this.video.WistiaId}`;
    }

    wistiaAsyncURL(): string {
        return this.video.WistiaVideoAssetUrl;
    }
    wistiaAsyncThumbnail(): string {
        return this.video.WistiaThumbnailAssetUrl;
    }
    /**
     * Play the video.
     *
     * @return {void}
     */
    play(): void {
        this.analyticsService.trackPageAction('Video', 'Play Video', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        this.videoService.play();
    }

    /**
     * Getter for the playing state of the video.
     *
     * @return {boolean}
     */
    get playing(): boolean {
        return this.videoService.playing;
    }

    /**
     * Setter for the playing state of the video.
     *
     * @param  {boolean} playing
     * @return {void}
     */
    set playing(playing: boolean) {
        this.videoService.playing = playing;
    }

    /**
     * Pause the video.
     *
     * @return {void}
     */
    pause(): void {
        this.analyticsService.trackPageAction('Video', 'Pause Video', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        this.videoService.pause();
    }

    /**
     * Getter for the paused state of the video.
     *
     * @return {boolean}
     */
    get paused(): boolean {
        return this.videoService.paused;
    }

    /**
     * Setter for the paused state of the video.
     *
     * @return {boolean}
     */
    set paused(paused) {
        this.videoService.paused = paused;
    }

    /**
     * Replay the video.
     *
     * @return {void}
     */
    replay(): void {
        this.analyticsService.trackPageAction('Video', 'Replay Video', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        this.done = false;
        setTimeout(() => {
            this.playing = true;
            this.videoService.play();
            this.videoService.video.currentTime = 0;
        });
    }

    /**
     * Getter for the duration of the video.
     *
     * @return {boolean}
     */
    get duration(): number {
        return this.videoService.duration;
    }

    /**
     * Setter for the duration of the video.
     *
     * @return {boolean}
     */
    set duration(duration) {
        this.videoService.duration = duration;
    }

    /**
     * Getter for the current time of the video.
     *
     * @return {boolean}
     */
    get time(): string {
        if (this.videoService.video) {
            return this.videoService.time;
        }

        return "0:00";
    }

    /**
     * Getter for the current time of the video.
     *
     * @return {boolean}
     */
    set time(time) {
        this.videoService.time = time;
    }

    /**
     * Getter for the watched state of the video.
     *
     * @return {boolean}
     */
    get watched(): number {
        return this.videoService.watched;
    }

    /**
     * Setter for the watched state of the video.
     *
     * @return {boolean}
     */
    set watched(watched) {
        this.videoService.watched = watched;
    }

    /**
     * On video touch.
     *
     * @return {void}
     */
    onTouch(): void {
        this.touching();
    }

    /**
     * Touching patterns.
     *
     * @return {void}
     */
    touching(): void {
        if (!this.minimized) {
            this.videoTouching = true;
            this.videoTouched = true;

            clearTimeout(this.videoTouchedTimeout);
            clearTimeout(this.videoTouchingTimeout);

            this.videoTouchingTimeout = setTimeout(() => {
                this.videoTouching = false;

                this.videoTouchedTimeout = setTimeout(() => {
                    this.videoTouched = false
                }, 3500);
            }, 3000);
        }
    }

    /**
     * Toggle the minimized state of the video modal.
     */
    toggleMinimize() {
        setTimeout(() => {
            // this.minimized = !this.minimized;

            if (this.minimized) {
                this.modalElement.style.transition = 'transform 200ms linear';
                this.modalElement.style.transform = 'translateY(100%)';
                this.modalElement.classList.add('minimized')
                this.modalElement.classList.add('active-player');
            }
            if (!this.minimized) {
                this.modalElement.style.transition = 'transform 200ms ease-in';
                this.modalElement.style.transform = 'translateY(0%)';
                this.modalElement.classList.remove('minimized');
            }
            this.cd.markForCheck();
        }, 0);

        return false;
    }

    /**
     * Toggle the fullscreen state of the video player.
     *
     * @return {void}
     */
    toggleFullScreen(): void {
        this.fullScreenToggled = true;
        
        try{
            this.analyticsService.trackPageAction('Video', 'Toggle Fullscreen', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
            this.fullScreen = (this.fullScreen) ? false : 'landscape-left';

            setTimeout(() => {
                this.fullScreenToggled = false;
            }, 5000)
        }
        catch(err){
            console.log(err);
        }
    }

    /**
     * Move the video position.
     *
     * @param  {any} event
     * @return {void}
     */
    videoPosition(event): void {
        this.onTouch();
    }

    /**
     * Open the audio player.
     *
     * @return {void}
     */
    openAudio(): void {
        let modal = this.modalCtrl.create(AudioPage, {
            video: this.video
        });

        modal.present().then(() => this.close());
    }

    /**
     * Destroy the current audio player.
     *
     * @return {void}
     */
    destroy(): void {
        this.videoService.destroy();
        this.modalElement.remove();
    }

    /**
     * Open the 12Stone podcast.
     *
     * @return {void}
     */
    openInItunes(): void {
        this.analyticsService.trackPageAction('Video', 'Video Opened in iTunes', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        new InAppBrowser('https://itunes.apple.com/us/podcast/12stone-church/id268809140', '_system');
    }

    /**
     * Open a link.
     */
    openLink(link: string): void {
        this.analyticsService.trackPageAction('Video', 'Click Link', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
        window.open(link, '_system');
    }

    /**
     * Sets the Video Clips.
     */
    setVideoClips(): void {
        if (this.video.RelatedPosts < 5) {
            this.getVideoClips();
        } else {
            this.video.RelatedPosts = this.video.RelatedPosts.slice(0, 5);
        }
    }

    /**
     * Gets related video clips for the video.
     *
     * @return {void}
     */
    getVideoClips(): void {
        let length = 5 - this.video.RelatedPosts.length;

        this.feed.getRelatedVideos(
            this.video,
            { SermonTopic: this.video.Topics.join('|'), Limit: length }
        ).then((videos) => {
            this.video.RelatedPosts = this.video.RelatedPosts.concat(videos);
        });
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

    /**
     * Share video.
     *
     * @param  {string} quote
     * @return void
     */
    shareQuote(quote: string): void {
        if (this.video.PermanentLink) {
            this.analyticsService.trackPageAction('Video', 'Video Quote Shared', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
            SocialSharing.share(
                quote,
                this.video.PostPostTitle,
                null,
                this.video.PermanentLink
            );
        }
    }

    /**
     * Share Image.
     *
     * @param  {string} image
     * @return void
     */
    shareImage(image: string): void {
        if (this.video.PermanentLink) {
            this.analyticsService.trackPageAction('Video', 'Video Image Shared', { permanentLink: this.video.PermanentLink, videoUrl: this.video.WistiaVideoAssetUrl });
            SocialSharing.share(
                this.video.PostExcerpt,
                this.video.PostPostTitle,
                image
            );
        }
    }
}
