import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { AppComponentsModule } from '../components';

import { AuthPage } from './auth/auth';
import { LoginPage } from './auth/login';
import { RegisterPage } from './auth/register';
import { ForgotPasswordPage } from './auth/forgot-password';
import { FeedPage } from './feed/feed';
import { SearchResultsPage } from './feed/search-results';
import { SeriesPage } from './feed/series';
import { FilterGroupsPage } from './groups/filter-groups';
import { GroupInfoPage } from './groups/group-info';
import { GroupMembersPage } from './groups/group-members';
import { GroupMessagePage } from './groups/group-message';
import { GroupMessageFormPage } from './groups/group-message-form';
import { GroupsPage } from './groups/groups';
import { GroupPage } from './groups/group';
import { MyGroupsPage } from './groups/my-groups';
import { AudioPage } from './feed/audio';
import { VideoPage } from './feed/video';
import { MorePage } from './more/more';
import { PrayerRequestPage } from './more/prayer-request';
import { SuggestionsPage } from './more/suggestions';
import { AboutPage } from './more/about';
import { ProfilePage } from './profile/profile';
import { EditProfilePage } from './profile/edit-profile';
import { TabsPage } from './tabs/tabs';
import { NotificationsPage } from './more/notifications';
import { SettingsPage } from './more/settings';

export { AuthPage } from './auth/auth';
export { LoginPage } from './auth/login';
export { RegisterPage } from './auth/register';
export { ForgotPasswordPage } from  './auth/forgot-password';
export { FeedPage } from './feed/feed';
export { SearchResultsPage } from './feed/search-results';
export { SeriesPage } from './feed/series';
export { FilterGroupsPage } from './groups/filter-groups';
export { GroupInfoPage } from './groups/group-info';
export { GroupMembersPage } from './groups/group-members';
export { GroupMessagePage } from './groups/group-message';
export { GroupMessageFormPage } from './groups/group-message-form';
export { GroupsPage } from './groups/groups';
export { GroupPage } from './groups/group';
export { MyGroupsPage } from './groups/my-groups';
export { AudioPage } from './feed/audio';
export { VideoPage } from './feed/video';
export { MorePage } from './more/more';
export { PrayerRequestPage } from './more/prayer-request';
export { SuggestionsPage } from './more/suggestions';
export { AboutPage } from './more/about';
export { ProfilePage } from './profile/profile';
export { EditProfilePage } from './profile/edit-profile';
export { TabsPage } from './tabs/tabs';
export { NotificationsPage } from './more/notifications';
export { SettingsPage } from './more/settings';

export const AppPages = [
    AuthPage,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    FeedPage,
    SearchResultsPage,
    SeriesPage,
    FilterGroupsPage,
    GroupInfoPage,
    GroupMembersPage,
    GroupMessagePage,
    GroupMessageFormPage,
    GroupsPage,
    GroupPage,
    MyGroupsPage,
    AudioPage,
    VideoPage,
    MorePage,
    PrayerRequestPage,
    SuggestionsPage,
    AboutPage,
    ProfilePage,
    EditProfilePage,
    TabsPage,
    NotificationsPage,
    SettingsPage
];

@NgModule({
    declarations: [
        ...AppPages
    ],
    imports: [
        IonicModule,
        AppComponentsModule
    ],
    exports: [
        AppComponentsModule,
        AppPages
    ]
})
export class AppPagesModule { }
