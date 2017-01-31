import { Injectable, ElementRef, NgZone } from '@angular/core';
import { Event } from '@12stonechurch/ngkit-mobile';

@Injectable()
export class VideoService {
    /**
     * The current video object.
     *
     * @type {any}
     */
    video: any = null;
    /**
     * The full object of the playing video.
     *
     * @type {any}
     */
    videoObject: any = null;

    /**
     * The object of the playing video.
     *
     * @type {any}
     */
    playingVideo: any = null;

    /**
     * The video element.
     */
    videoElement: ElementRef;

    /**
     * The playing state.
     *
     * @type {boolean}
     */
    playing: boolean = false;

    /**
     * The paused state.
     *
     * @type {boolean}
     */
    paused: boolean = false;

    /**
     * The duration of the video.
     *
     * @type {any}
     */
    duration: any = "0:00";

    /**
     * The subscriptions of the service.
     *
     * @type {Subscription}
     */
    subs = {};

    /**
     * The current time of the video.
     *
     * @type {number}
     */
    public _time: any = null;

    /**
     * Getter for the current time of the video.
     *
     * @type {number}
     */
    get time(): string {
        if (this.video) {
            //this._time = this.convertSeconds(this.video.currentTime);
            //return this._time;
            let ttime = this.convertSeconds(this.video.currentTime);
            return ttime;
        }
        return "0:00";
    }

    /**
     * Setter for the current time.
     * @param  {string} time
     */
    set time(time) {
        this._time = time;
    }

    /**
     * Getter for the percent watched of the video.
     *
     * @type {number}
     */
    get watched(): number {
        return this.video ? Math.round((this.video.currentTime / this.video.duration) * 100) : 0;
    }

    /**
     * Setter for the percent watched of the video.
     *
     * @type {number}
     */
    set watched(watched) {
        let seconds = (watched / 100) * this.video.duration;
        try{
        this.video.currentTime = seconds;
        }
        catch(err){
            console.log(err);
        }
    }

    /**
     * Interval to check the current time.
     *
     * @type {any}
     */
    timeInterval: any = null;

    /**
     * Constructor.
     */
    constructor(public event: Event, private _ngZone: NgZone) { }

    /**
     * Initialize a video.
     *
     * @param  {element} ElementRef
     * @param  {any} video
     * @return {void}
     */
    init(element: ElementRef, video: any): Promise<any> {
        this.videoObject = video;
        this.videoElement = element;
        this.video = this.videoElement.nativeElement.querySelector('video');

        return new Promise((resolve, reject) => { 
            //this.adjustVideoElement();
            this.duration = this.convertSeconds(video.VideoDurationInSeconds);
            //this.videoEvents();
            resolve(true)
        });
    }

    /**
     * Destory a video instance.
     *
     * @return {void}
     */
    destroy() {
        if (this.video) {
            this.video.remove();
            this.video = null;
        }

        if (this.playingVideo) {
            this.event.broadcast('video:stopping', this.playingVideo.Id);
            this.playingVideo = null;
        } else {
            this.event.broadcast('video:stopping', true);
        }

        clearInterval(this.timeInterval);
    }

    /**
     *  Play the current video.
     *
     * @return {void}
     */
    play(): void {
        if (this.video) {
            this.video.play();
            this.playing = true;
            this.paused = false;
            this.playingVideo = this.videoObject;
            setTimeout(() => {
                this.event.broadcast('video:playing', this.playingVideo.Id);
            }, 500);
        }
    }

    /**
     * Pause the video.
     *
     * @return {void}
     */
    pause(): void {
        if (this.playing) {
            this.paused = true;
            this.video.pause();
            setTimeout(() => {
                this.event.broadcast('video:paused', this.playingVideo.Id);
            }, 100);
            setTimeout(() => this.playing = false, 100);
        };
    }

    /**
     * Video event listeners.
     *
     * @return {void}
     */
    videoEvents(): void {
        this.video.bind('play', () => this.onPlay());
        this.video.bind('pause', () => this.onPause());
        this.video.bind('end', () => this.onEnd());
    }

    /**
     * On play event.
     *
     * @return {void}
     */
    onPlay(): void {
        if (!this.timeInterval) {
            this.timeInterval = setInterval(() => {
                this._time = this.convertSeconds(this.video.currentTime);
            }, 500);
        }
    }

    /**
     * On pause event.
     *
     * @return {void}
     */
    onPause(): void {
        this.playing = false;
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }

    /**
     * On end event.
     *
     * @return {void}
     */
    onEnd(): void {
        this.video.currentTime = 0;
        this.playing = false;
        this.event.broadcast('video:stopping', this.playingVideo.Id);
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }

    /**
     * Set the video controls of the video element.
     *
     * @return {void}
     */
    adjustVideoElement(): void {
        let videoElement = this.videoElement
            .nativeElement
            .getElementsByTagName('video')[0];

        if (videoElement) {
            videoElement.innerHTML = '';
            this.getMp4s().forEach(source => {
                videoElement.appendChild(source);
            });

            videoElement.removeAttribute('controls');
            videoElement.setAttribute('webkit-playsinline', true);
            videoElement.setAttribute('playsinline', true);
            videoElement.setAttribute('title', this.videoObject.PostTitle);
        }
    }

    /**
     * Get mp4s from the video object.
     *
     * @return {any[]}
     */
    getMp4s(): any[] {
        let sources = [];
        /*let mp4s = this.video.data.media.assets.filter(asset => asset.ext == 'mp4');
        mp4s.sort((a, b) => a.size - b.size)
            .forEach(mp4 => {
                let source = document.createElement('source');
                source.src = mp4.url;
                source.type = `video/${mp4.ext}`;
                sources.push(source)
            })
            */
        let source = document.createElement('source');
                source.src = this.video.WistiaVideoAssetUrl;
                source.type = `video/mp4`;
                sources.push(source)
        return sources;
    }

    /**
     * Convert seconds to a time string.
     *
     * @param  {number} time
     * @return {string}
     */
    convertSeconds(seconds: number): string {
        seconds = Number(seconds);
        let h = Math.floor(seconds / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 3600 % 60);
        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
    }
}
