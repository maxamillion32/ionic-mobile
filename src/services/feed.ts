import { SeriesModel, VideoModel } from '@12stonechurch/12Stone-angular-mobile';
import { Injectable } from '@angular/core';
import { Http, Cache } from '@12stonechurch/ngkit-mobile';

@Injectable()
export class FeedService {
    /**
     * Constructor.
     * @param  {Http} http
     */
    constructor(
        public http: Http,
        public cache: Cache
    ) { }

    /**
     * List all series from API.
     *
     * @para  {any} params
     * @return {Promise<any>}
     */
    listSeries(params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Series`, params).first().subscribe((res: any) => {
                res.Results = res.Results.map(series => series.RowData)
                    .map(series => {
                        // REVIEW: Is this dangerous?
                        if (series.Messages.length) {
                            series.Messages = series.Messages.map(message => {
                                message.Series = Object.assign({}, series);

                                return new VideoModel(message);
                            });

                            series.VideoClips = series.Messages.map(message => {
                                return message.RelatedPosts.map(video_clip => {
                                    return new VideoModel(video_clip);
                                });
                            }).reduce((pre, curr) => pre.concat(curr));

                            series = new SeriesModel(series)
                            series.FeedVideos = series.FeedVideos();

                            return series;
                        }
                    });

                resolve(res);
            }, error => reject(error));
        });
    }

    /**
     *  Get a single series from the API.
     *
     * @param  {number} series_id
     * @return {Promise<any>}
     */
    getSeries(series_id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Series/${series_id}`).first().subscribe((res: any) => {
                resolve(new SeriesModel(res));
            }, error => reject(error));
        });
    }

    /**
     * List the messages of a serieis from api.
     *
     * @param  {number} series_id
     * @return {Promise<any>}
     */
    listSeriesMessages(series_id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Series/${series_id}/Messages`).first()
                .subscribe((res: any) => {
                    resolve(res);
                }, error => reject(error));
        });
    }

    /**
     * List messages from the API.
     *
     * @params  {any} params
     * @return {Promise<any>}
     */
    listMessages(params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Messages`, params).first().subscribe((res: any) => {
                res.Results = res.Results.map(message => message.RowData);
                resolve(res);
            }, error => reject(error));
        });
    }

    /**
     * Get a single message from the api.
     *
     * @param  {number} message_id
     * @return {Promise<any>}
     */
    getMessage(message_id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Messages/${message_id}`).first()
                .subscribe((res: any) => {
                    resolve(res);
                }, error => reject(error));
        });
    }

    /**
     * Search feed data from the api.
     *
     * @param  {any} search
     * @param  {any} params
     */
    search(search, params: any = {}): any {
        params = this.http.buildParams(params);

        return this.http.post(`Feed/Search?${params}`, search).map((res: any) => {
            res.Results = res.Results.map(result => result.RowData);

            return res;
        }).first();
    }

    /**
     * Get videos from the api.
     *
     * @param  {number} message_id
     * @return {Promise<any>}
     */
    getVideos(params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`Feed/Videos`, params).first().subscribe((res: any) => {
                resolve(res);
            }, error => reject(error));
        });
    }

    /**
     * Get videos from the api.
     *
     * @param  {Video} video
     * @return {Promise<any>}
     */
    getRelatedVideos(video, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getVideos(params)
                .then((res: any) => {
                    res = res.Results.map(result => result.RowData);
                    resolve(res);
                });
        });
    }

    /**
     * Get search tags from the api.
     *
     * @param  {number} message_id
     * @return {Promise<any>}
     */
    getSearchTags(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.cache.has('feed:tags')) {
                resolve(this.cache.get('feed:tags'))
            } else {
                this.http.get(`Feed/Tags`, { Limit: 50 }).first()
                    .subscribe((res: any) => {
                        res = res.Results.map(result => result.RowData);
                        this.cache.set('feed:tags', res, 60);
                        resolve(res);
                    }, error => reject(error));
            }
        });
    }
}
