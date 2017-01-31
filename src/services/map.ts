import { LookupService, MapService as Maps } from '@12stonechurch/12Stone-angular-mobile';
import { Injectable, EventEmitter } from '@angular/core';
import { Geolocation, Keyboard } from 'ionic-native';
import { Cache } from '@12stonechurch/ngkit-mobile';
import { Observable } from 'rxjs';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';

@Injectable()
export class MapService extends Maps {
    /**
     * The Google maps instance.
     *
     * @type {any}
     */
    map: any = null;

    /**
     * Map events to create subscriptions on.
     *
     * @type {any}
     */
    _mapEvents: string[] = [
        'click',
        'movestart',
        'touchmove'
    ];

    /**
     * Array of map event subscriptions.
     *
     * @type {any[]}
     */
    mapEventSubscriptions: any[] = [];

    /**
     * Marker events to create subscriptions for.
     *
     * @type {string[]}
     */
    _markerEvents: string[] = [
        'click'
    ];

    /**
     * Array of marker event subscriptions.
     *
     * @type {any[]}
     */
    markerEventSubscriptions: any[] = [];

    /**
     * The location of the current user.
     *
     * @type {any}
     */
    userLocation: any = null;

    /**
     * If the map is at the user location.
     *
     * @type {boolean}
     */
    atUserLocation: boolean;

    /**
     * The state of the getting the user's location.
     *
     * @type {any}
     */
    retrieveingUserLocation: boolean = false;

    /**
     * On Ready event emitter.
     *
     * @return {EventEmitter<any>}
     */
    ready: EventEmitter<any> = new EventEmitter();

    /**
     * On camera change event emitter.
     *
     * @return {EventEmitter<any>}
     */
    cameraChange: EventEmitter<any> = new EventEmitter();

    /**
     * State of internal camera change.
     *
     * @type {boolean}
     */
    internalCameraChange: boolean = false;

    /**
     * Event when searching by tapping markers.
     *
     * @type {boolean}
     */
    markerIndex: EventEmitter<any> = new EventEmitter();

    /**
     * Groups of the service.
     *
     * @type {any}
     */
    _groups: any[] = [];

    /**
     * The collection of google maps markers.
     *
     * @type {GoogleMapsMarker[]}
     */
    public _markers: any[] = [];

    /**
     * The html element of the map.
     *
     * @type {HTMLElement}
     */
    element: HTMLElement;

    /**
     * Groups getter.
     *
     * @return {any[]}
     */
    get groups(): any[] { return this._groups }

    /**
     * Setter for groups.
     *
     * @param  {any[]} groups
     */
    set groups(groups) {
        this._groups = groups;
        this.addMarkers();
    };

    /**
     * Constructor.
     *
     * @param  {LookupService} privatelookup
     */
    constructor(
        public lookup: LookupService,
        public cache: Cache,
    ) {
        super();
        //this.lookup.get('Congregations')
    }

    /**
     * Create the map of the service.
     *
     * @return {void}
     */
    createMap(): void {
        const CENTRAL_CAMPUS = new mapboxgl.LngLat(-83.9960802, 33.9969975);

        this.createMapElement();

        mapboxgl.accessToken = 'pk.eyJ1IjoidGxhdmVyZHVyZSIsImEiOiJjaXJqa3VubzQwMDA3a3FuYnBmanA3bGRzIn0.FLCK8MaoI06IZ8TvUksBiw';

        this.map = new mapboxgl.Map({
            center: CENTRAL_CAMPUS,
            container: this.element,
            zoom: 9,
            style: 'mapbox://styles/mapbox/streets-v9'
        });
    }

    /**
     * Create the map element.
     *
     * @return {void}
     */
    private createMapElement(): void {
        let element = document.createElement('div');

        element.setAttribute('id', 'map-canvas');
        element.setAttribute('style', 'height: 100%; width: 100%;');

        this.element = element;
    }

    /**
     * Initialize the map.
     *
     * @return {void}
     */
    initMap(): void {
        this.map.resize();

        this.getUsersLocation().then(location => {
            this.addUserMarker();
            this.ready.next(true);
        }, error => {
            this.ready.next(true);
            console.error(error);
        });

        this.mapEvents();

        if (this._markers.length) {
            this.watchMarkers();
        }
    }

    /**
     * Method to tear down map.
     *
     * @return {void}
     */
    destroy(): void {
        //this.map.remove();
        //this.map = null;
        this.mapEventSubscriptions.forEach(sub => sub.unsubscribe());
        this.markerEventSubscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * Add markers to the map.
     *
     * @return {void}
     */
    addMarkers(): void {
        this.removeGroupMarkers().then(() => {
            if (this.groups) {
                this.groups.forEach((group, i) => this.addGroupMarker(group, i));
            }
        });
    }

    /**
     * Add a marker to the map.
     *
     * @param {any} groups
     * @param {number} index
     * @return {void}
     */
    addGroupMarker(group: any, index: number): void {

        if (group.Latitude && group.Longitude) {
            let marker = new mapboxgl.Marker().setLngLat([
                group.Longitude,
                group.Latitude
            ]).addTo(this.map);

            (<any>marker)._element.classList.add('group-marker');
            (<any>marker).id = Math.random().toString(36).substring(7);
            (<any>marker).is_group = true;
            (<any>marker).group_id = group.GroupId;
            marker = this.markerEvents(marker);

            this._groups[index].marker_id = (<any>marker).id;
            this._markers.push(marker);
        }
    }

    /**
     * Add events to markers.
     *
     * @return {void}
     */
    watchMarkers(): void {
        this._markers.forEach(marker => this.markerEvents(marker));
    }

    /**
     * Remove markers from the map.
     *
     * @return {Promise<any>}
     */
    removeGroupMarkers(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.markerEventSubscriptions.forEach(sub => sub.unsubscribe());
            let markers = [];

            this._markers.forEach((marker, i) => {
                if (marker.is_group || marker.group_id) {
                    marker.remove();
                } else {
                    markers.push(marker);
                }
            });

            this._markers = markers;

            resolve(markers);
        });
    }

    /**
     * Add a marker to the map for the user.
     *
     * @return {void}
     */
    addUserMarker(): void {
        let user_marker = this._markers.find(marker => marker.is_user);

        if (this.userLocation && !user_marker) {
            let marker = new mapboxgl.Marker().setLngLat([
                this.userLocation.coords.longitude,
                this.userLocation.coords.latitude
            ]).addTo(this.map);
   
            (<any>marker)._element.classList.add('user-marker');
            (<any>marker).is_user = true;

            this._markers.push(marker);
        }
    }

    /**
     * Map events.
     *
     * @return {void}
     */
    mapEvents(): void {
        this._mapEvents.forEach(map_event => {
            let observer = Observable.fromEvent(this.map, map_event);

            let subscription = observer.debounceTime(500)
                .subscribe(event => {
                    this[`on_${map_event.toLowerCase()}`](event)
                });

            this.mapEventSubscriptions.push(subscription);
        });
    }

    /**
     * Marker events.
     *
     * @paarm {any} marker
     * @return {any}
     */
    markerEvents(marker): any {
        this._markerEvents.forEach(marker_event => {
            let observer = Observable.fromEvent(marker._element, marker_event);

            let subscription = observer.subscribe(event => {
                this[`on_marker_${marker_event.toLowerCase()}`](event, marker)
            });

            this.markerEventSubscriptions.push(subscription);
        });

        return marker;
    }

    /**
     * Return the users current location.
     *
     * @return {Promise}
     */
    getUsersLocation(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.userLocation) {
                resolve(this.userLocation);
            } else if (this.cache.has('user:location')) {
                resolve(this.cache.get('user:location'));
            } else {
                this.setUsersLocation().then(() => {
                    this.cache.set('user:location', this.userLocation, 10);
                    resolve(this.userLocation);
                }, error => reject("Cannot get user's location."))
            }
        });
    }

    /**
     * Set the users current location.
     *
     * @return {Promise}
     */
    setUsersLocation(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.retrieveingUserLocation = true;

            Geolocation.getCurrentPosition().then((res) => {
                this.userLocation = res;
                this.retrieveingUserLocation = false;

                resolve(this.userLocation);
            }, () => {
                this.retrieveingUserLocation = false;
                reject("Cannot set user's location.");
            });
        });
    }

    /**
     * Get the bounds of the map.
     *
     * @return {Promise<any>}
     */
    getBounds(): Promise<any> {
        return new Promise((resolve, reject) => resolve(this.map.getBounds()));
    }

    /**
     * Move the center of the map to a loction.
     *
     * @param  {any} location
     * @param  {any} options
     * @param  {any} callback
     * @return {void}
     */
    moveTo(location: any, options: any = {}, resolve: any): void {
        if (location) {
            let target = new mapboxgl.LngLat(location.longitude, location.latitude);
            let defaultOptions = {
                center: target,
                zoom: 9
            };

            options = Object.assign(defaultOptions, options);
            this.internalCameraChange = true;

            this.map.flyTo(options);
            setTimeout(() => { resolve() }, 1200);
        }
    }

    /**
     * Move the map camera to the user's location.
     *
     * @return {void}
     */
    moveToUser(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.userLocation) {
                if (!this._markers.find(m => m.is_user)) {
                    this.addUserMarker();
                };

                this.moveTo(this.userLocation.coords, {}, resolve);
                this.atUserLocation = true;
            } else {
                this.setUsersLocation().then(() => {
                    this.addUserMarker();
                    this.moveTo(this.userLocation.coords, {}, resolve);
                    this.atUserLocation = true;
                }, () => reject('User location not available.'));
            }
        });
    }

    /**
     * Set the active marker
     *
     * @param  {any} group
     * @return {void}
     */
    activeMarker(group_id: number): void {
        this.removeActiveMarker();

        if (!group_id) return;

        let activeGroup = this._groups.find(g => {
            return group_id == g.GroupId
        });

        if (activeGroup.marker_id) {
            let marker = this._markers.find(marker => {
                return marker.id == activeGroup.marker_id;
            });

            marker.active = true;
            marker._element.classList.add('active-group');
        }
    }

    /**
     * Remove the active marker from the map.
     *
     * @return {void}
     */
    removeActiveMarker() {
        if (this._markers.length) {
            let activeIndex = this._markers.findIndex(marker => marker.active);

            if (activeIndex >= 0) {
                this._markers[activeIndex].active = false;
                this._markers[activeIndex]._element.classList.remove('active-group');
            }
        }
    }

    /**
     * On camera change event handler.
     *
     * @param  {any} event
     * @return {void}
     */
    on_movestart(event: any): void {
        if (!this.internalCameraChange) {
            this.atUserLocation = false;
        }
        this.internalCameraChange = false;
        this.cameraChange.emit(event);
    }

    /**
     * On move end event handler.
     *
     * @param  {any} event
     * @return {void}
     */
    on_touchmove(event: any): void {
        if (!this.internalCameraChange) {
            this.atUserLocation = false;
        }
        this.internalCameraChange = false;
        this.cameraChange.emit(event);
    }

    /**
     * On map click event handler.
     *
     * @param  {any} event
     * @return {void}
     */
    on_click(event: any): void {
        Keyboard.close();

        if (!event.originalEvent.target.classList.contains('group-marker')) {
            this.markerIndex.emit(null);
            this.removeActiveMarker();
        }
    }

    /**
     * Marker clicked event handeler.
     *
     * @param  {any} event
     * @param  {any} marker
     * @return {void}
     */
    on_marker_click(event, marker): boolean {
        let index = this._markers.findIndex(m => m.group_id == marker.group_id);

        if (index >= 0) {
            this.activeMarker(marker.group_id);
            this.markerIndex.emit(index);
        }

        return false;
    }
}
