import { Authorization, Config, Event, Http, Token } from '@12stonechurch/ngkit-mobile';
import { SocialAuth } from '@12stonechurch/12Stone-angular-mobile';
import { Injectable } from '@angular/core';
import { Facebook } from 'ionic-native';

@Injectable()
export class SocialAuthentication extends SocialAuth {
    /**
     * Constructor
     */
    constructor(
        public authorization: Authorization,
        public config: Config,
        public event: Event,
        public http: Http,
        public token: Token
    ) {
        super(authorization, config, event, http, token);
    }

    /**
     * Login with facebook.
     *
     * @return {Promise<any>}
     */
    facebookLogin(): Promise<any> {
        return new Promise((resolve, reject) => {

            var scope = this.config.get('authentication.social.facebook.scope').split(',');

            Facebook.login(scope)
                .then((res: any) => {
                    res.network = 'facebook';
                    res.authResponse.access_token = res.authResponse.accessToken;

                    this.handleLoginSuccess(res).then((res) => {
                        this.onLogin(res).then(() => resolve(res));
                    }, (error) => { reject(this.handleLoginError(error)) });
                });
        });
    }
}
