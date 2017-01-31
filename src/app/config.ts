    /**
     * Ionic App Configuration.
     * 
     * @type{Object}
     */
    export const ionicAppConfig: any =
    {
        tabsPlacement:"bottom",
        mode:"ios",
        platforms:{
            ios:{
                statusbarPadding: true
            }
        },
        prodMode: true
    };

    /**
     * Ionic Cloud Configuration
     * 
     * @type { CloudSettings }
     */
    export const ionicCloudSettings: any =
    {
        core:{
            app_id:"89d8048a"
        },
        push: {
            sender_id: "443544379566",
            pluginConfig: {
                ios: {
                    badge: true,
                    sound: true
                },
                android: {
                    iconColor: "#343434"
                }
            }
        }
    }

    /**
     * NgKit Configuration.
     * 
     * @type {Object}
     */
    export const ngkitConfig: any =
    {
        authentication:{
            endpoints:{
                check:"",
                forgotPassword:"Security/ForgotPassword",
                getUser:"Users/GetProfile",
                login:"Security/Login",
                register:"Security/Register",
                resetPassword:"Security/ResetPassword",
                socialAuth:"Security/SocialLoginRegister"
            },
            social:{
                facebook:{
                    id:"137338430018154",
                    scope:"public_profile,email"
                },
                twitter:{
                    id:"g1ArPlRxbd8LOSmSPCn6fTMvl"
                },
                oauthProxy:"http://my.12stone.dev:3000/oauthproxy"
            }
        },
        http:{
            baseUrl:"https://api.12stone.church",
            headers:{
                "CCC-APIKEY":"5bbbdcfc-58c3-4874-bf52-9b3ba242abf7"
            }
        },
        token:{
            readAs:"AuthenticationToken"
        }
    }

    /**
     * 12Stone Angular Config.
     *
     * @type {Object}
     */
    export const twelveStoneAngularConfig: any =
    {
        env:"prod",
        pusherKey:"6a4bc4abf736ff7043a3",
        pusherAuthEndpoint:"https://api.12stone.church/Notifications/AuthenticateChannel",
        mixpanelId:"4bdefac67662de2600a3155d0c375a5d",
        mixpanelApplicationName: "12Stone Mobile",
        mixpanelApplicationChannel: "Production",
        mixpanelApplicationHostEnvironment: "Mobile",
        appRootUrl:"https://my.12stone.church",
        versionNumber:"0.0.0.0"
    }