import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { AuthFormErrors } from './auth/auth-form-errors';
import { NextWeekComponent } from './feed/next-week';
import { FeedSearchComponent } from './feed/search';
import { LoginForm } from './auth/login-form';
import { GroupCardComponent } from './groups/group-card';
import { GroupDataListComponent } from './groups/group-data-list';
import { GroupMessageCardComponent } from './groups/group-message-card';
import { GroupMessageCommentComponent } from './groups/group-message-comment';
import { GroupsMapComponent } from './groups/groups-map';
import { SearchBarComponent } from './groups/search-bar';
import { SearchFiltersComponent } from './groups/search-filters';
import { GroupsSearchResultsComponent } from './groups/search-results';
import { GroupImageComponent } from './groups/group-image';
import { ClipsSermonsSegmentComponent } from './feed/clips-sermons-segment';
import { SeriesCardComponent } from './feed/series-card';
import { VideoItemComponent } from './feed/video-item';
import { SortByValue } from './../pipes/sort-by-value';
import { Decode } from './../pipes/decode';
import { UserImageComponent } from './user/user-image';
import { VideoImageComponent } from './feed/video-image';

export const AppComponents = [
    AuthFormErrors,
    NextWeekComponent,
    FeedSearchComponent,
    LoginForm,
    GroupCardComponent,
    GroupDataListComponent,
    GroupMessageCardComponent,
    GroupMessageCommentComponent,
    GroupsMapComponent,
    GroupImageComponent,
    SearchBarComponent,
    SearchFiltersComponent,
    GroupsSearchResultsComponent,
    ClipsSermonsSegmentComponent,
    SeriesCardComponent,
    VideoItemComponent,
    UserImageComponent,
    VideoImageComponent
];

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    declarations: [
        AppComponents,
        SortByValue,
        Decode
    ],
    exports: [
        AppComponents,
        SortByValue,
        Decode
    ]
})
export class AppComponentsModule { }
