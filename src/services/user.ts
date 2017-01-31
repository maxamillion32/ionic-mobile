import { Injectable } from '@angular/core';
import { Http } from '@12stonechurch/ngkit-mobile';

@Injectable()
export class UserService {
    /**
     * Constructor.
     *
     * @param  {Http}
     */
    constructor(public http: Http) { }

    /**
     * Get a user from the API.
     *
     * @return {Promise}
     */
    get(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get('Users/GetProfile').first()
                .subscribe((user) => resolve(user));
        });
    }

    /**
     * Update a user.
     *
     * @param {object}  data
     * @return put user/id
     */
    update(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.put('Users/UpdateProfile', data).first()
                .subscribe(res => resolve(res));
        });
    }

    /**
     * Update a user's photo.
     *
     * @param {object}  data
     * @return {[type]} [description]
     */
    updatePhoto(data) {
        return new Promise((resolve, reject) => {
            let binary = atob(data.split(',')[1]);
            let mimestring = data.split(',')[0].split(':')[1].split(';')[0]
            let binaryArray = [];

            for (let i = 0; i < binary.length; i++) {
                binaryArray.push(binary.charCodeAt(i));
            }

            let blob = new Blob([new Uint8Array(binaryArray)], { type: mimestring });

            this.http.postFile('Users/UpdatePhoto', [blob]).first()
                .subscribe(res => resolve(res), error => reject(error));
        });
    }
}
