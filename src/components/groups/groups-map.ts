import {
    Component, OnInit, Input, Output, EventEmitter, ViewChild
} from '@angular/core';
import { MapService } from '../../services'

@Component({
    selector: 'groups-map',
    templateUrl: './groups-map.html',
})
export class GroupsMapComponent implements OnInit {
    /**
     * The event to emit when map is ready.
     * .
     * @return {EventEmitter}
     */
    @Output() ready: EventEmitter<any> = this.mapService.ready;

    /**
     * The event to emit when map is re-positioned.
     * .
     * @return {EventEmitter}
     */
    @Output() bounds: EventEmitter<any> = new EventEmitter();

    /**
     * The element of the map.
     */
    @ViewChild('mapContainer') mapContainer;

    /**
     * Groups of the component.
     *
     * @type {any}
     */
    private _groups: any[] = [];

    /**
     * The HTML element of the map.
     *
     * @type {HTMLElement}
     */
    map: HTMLElement;

    /**
     * Groups input.
     *
     * @return {groups}
     */
    @Input()
    set groups(groups) {
        this._groups = groups;
    };

    /**
     * Groups getter.
     *
     * @return {any[]}
     */
    get groups(): any[] { return this._groups }

    /**
     * Constructor.
     */
    constructor(public mapService: MapService) { }

    /**
     * On component init.
     *
     * @return {void}
     */
    ngOnInit(): void { }

    /**
     * On view init.
     *
     * @return {void}
     */
    ngAfterViewInit(): void {
        if (this.mapContainer) {
            this.mapContainer.nativeElement.appendChild(this.mapService.element);
        }

        setTimeout(() => this.mapService.initMap(), 300);
    }

    /**
     * On component destroy.
     *
     * @return {void}
     */
    ngOnDestroy(): void {
        if (this.mapService.map) {
            this.mapService.destroy();
        }
    }
}
