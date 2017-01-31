import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SystemService {
    /**
     * Service subscriptions.
     *
     * @type {any}
     */
    subs: any = {}

    /**
     * Constructor.
     */
    constructor() {
        this.subs['onConnect'] = Observable.fromEvent(window, 'online');
        this.subs['onDisconnect'] = Observable.fromEvent(window, 'offline');
    }

    /**
     * Check the network connectivity.
     *
     * @return {boolean}
     */
    online(): boolean {
        return navigator.onLine;
    }

    /**
     * On network connect subscription.
     *
     * @return {Observable}
     */
    onConnect(): Observable<any> {
        return this.subs['onConnect'];
    }

    /**
     * On network connect subscription.
     *
     * @return {Observable}
     */
    onDisconnect(): Observable<any> {
        return this.subs['onDisconnect'];
    }
}
