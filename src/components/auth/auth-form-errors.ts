import {Component, Input} from '@angular/core';
import _ from 'lodash';

@Component({
    selector: 'auth-form-errors',
    templateUrl: './auth-form-errors.html'
})
export class AuthFormErrors {
    /**
     * Input of form errors.
     *
     * @return {any}
     */
    @Input() errors: any;

    /**
     * Constructor.
     */
    constructor() { }

    /**
     * Get errors from input.
     *
     * @return {mixed}
     */
    get error() {
        if (this.errors) {
            return (_.isObject(this.errors)) ? _.values(this.errors)[0] : this.errors;
        }

        return null;
    }
}
