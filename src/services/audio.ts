import { Injectable, ElementRef } from '@angular/core';
import { Event } from '@12stonechurch/ngkit-mobile';

@Injectable()
export class AudioService {
    /**
     * The current audio object.
     *
     * @type {any}
     */
    audio: any;

    /**
     * The audio element.
     */
    audioElement: HTMLAudioElement;

    /**
     * The source of the audio.
     *
     * @type {any}
     */
    sourceObject: any;

    /**
     * The object of the playing audio.
     *
     * @type {any}
     */
    playingAudio: any = null;

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
     * The current time of the audio.
     *
     * @type {number}
     */
    private _time: any;

    /**
     * Getter for the current time of the video.
     *
     * @type {number}
     */
    get currentTime(): string {
        if (this.audioElement) {
            return this._time = this.convertSeconds(this.audioElement.currentTime);
        }

        return "0:00";
    }

    /**
     * The current time remaining of the audio.
     *
     * @type {number}
     */
    private _timeRemaining: any;

    /**
     * Getter for the current time of the video.
     *
     * @type {number}
     */
    get timeRemaining(): string {
        if (this.audioElement) {
            this._timeRemaining = this.convertSeconds(this.audioElement.duration - this.audioElement.currentTime);

            return this._timeRemaining ? this._timeRemaining : this.convertSeconds(this.audioElement.duration);
        }
    }

    /**
     * Getter for the percent watched of the audio.
     *
     * @type {number}
     */
    get listened(): number {
        return this.audioElement ? Math.round((this.audioElement.currentTime / this.audioElement.duration) * 100) : 0;
    }

    /**
     * Setter for the percent watched of the video.
     *
     * @type {number}
     */
    set listened(listened) {
        let seconds = (listened / 100) * this.audioElement.duration;

        this.audioElement.currentTime = seconds;
    }

    /**
     * Interval to check the current time.
     *
     * @type {any}
     */
    timeInterval: any;

    /**
     * Constructor.
     */
    constructor(public event: Event) { }

    /**
     * Initialize an audio player.
     *
     * @param  {element} ElementRef
     * @param  {any} source
     * @return {Promise<any>}
     */
    init(element: ElementRef, source: any): Promise<any> {
        this.sourceObject = source;
        this.event.broadcast('audio:init', this.sourceObject);

        return new Promise((resolve, reject) => {
            if (element) {
                this.audioElement = <HTMLAudioElement>(element.nativeElement);
                this.audioEvents();
                resolve(this.audioElement);
            } else {
                reject('Audio could not be loaded.');
            }
        });
    }

    /**
     * Destory a video instance.
     *
     * @return {void}
     */
    destroy() {
        this.playingAudio = null;
        clearInterval(this.timeInterval);
    }

    /**
     *  Play the current video.
     *
     * @return {void}
     */
    play(): void {
        this.audioElement.play();
        this.playing = true;
        this.paused = false;
        this.playingAudio = this.sourceObject;
        this.event.broadcast('audio:playing', this.playingAudio);
    }

    /**
     * Pause the video.
     *
     * @return {void}
     */
    pause(): void {
        if (this.playing) {
            this.paused = true;
            this.audioElement.pause();
            this.event.broadcast('audio:playing', false);
            setTimeout(() => this.playing = false, 100);
        };
    }

    /**
     * Mute the audio.
     *
     * @return {void}
     */
    mute(): void { }

    /**
     * Video event listeners.
     *
     * @return {void}
     */
    audioEvents(): void {
        this.audioElement.addEventListener('play', () => this.onPlay());
        this.audioElement.addEventListener('pause', () => this.onPause());
        this.audioElement.addEventListener('end', () => this.onEnd());
    }

    /**
     * On play event.
     *
     * @return {void}
     */
    onPlay(): void {
        if (!this.timeInterval) {
            this.timeInterval = setInterval(() => {
                this._time = this.convertSeconds(this.audioElement.currentTime);
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
        this.event.broadcast('audio:playing', this.playing);
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }

    /**
     * On end event.
     *
     * @return {void}
     */
    onEnd(): void {
        this.audioElement.currentTime = 0;
        this.playing = false;
        this.event.broadcast('audio:playing', this.playing);
        clearInterval(this.timeInterval);
        this.timeInterval = null;
    }

    /**
     * Set the video controls of the video element.
     *
     * @return {void}
     */
    adjustAudioElement(): void {
        // let videoElement = this.videoElement
        //     .nativeElement
        //     .getElementsByTagName('video')[0];
        //
        // videoElement.removeAttribute('controls');
        // videoElement.setAttribute('webkit-playsinline', true);
    }

    seekJump(direction: string, amount: number = 30) {
        let currentTime = this.audioElement.currentTime;
        let duration = this.audioElement.duration;

        if (direction == 'back') {
            if ((currentTime - amount) < 0) {
                this.audioElement.currentTime = 0;
            } else {
                this.audioElement.currentTime = currentTime - amount;
            }
        }

        if (direction == 'forward') {
            if ((this.audioElement.currentTime + amount) >= duration) {
                this.audioElement.currentTime = duration;
            }
            else {
                this.audioElement.currentTime = currentTime + amount;
            }
        }
    }

    /**
     * Convert seconds to a time string.
     *
     * @param  {number} time
     * @return {string}
     */
    convertSeconds(seconds: number): string {
        seconds = Number(seconds);

        if (!isNaN(seconds)) {
            let h = Math.floor(seconds / 3600);
            let m = Math.floor(seconds % 3600 / 60);
            let s = Math.floor(seconds % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }

        return null;
    }
}
