import { SocialAuthentication } from './social-authentication';
import { BodyClass } from './body-class';
import { SystemService } from './system';
import { VideoService } from './video';
import { AudioService } from './audio';
import { FeedService } from './feed';
import { UserService } from './user';
import { MapService } from './map';
import { PushService } from './push';

export { SocialAuthentication } from './social-authentication';
export { SystemService } from './system';
export { BodyClass } from './body-class';
export { VideoService } from './video';
export { AudioService } from './audio';
export { FeedService } from './feed';
export { UserService } from './user';
export { MapService } from './map';
export { PushService } from './push';

export const AppProviders = [
    SocialAuthentication,
    SystemService,
    BodyClass,
    UserService,
    MapService,
    VideoService,
    AudioService,
    FeedService,
    PushService
];
