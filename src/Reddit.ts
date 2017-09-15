import * as Bluebird from "bluebird";
import { trim, compact } from "lodash";

import { IRedditConfig } from "./IConfig";

/**
 * Liefert gekapselt unsere Methoden um mit Reddit zu interagieren.
 *
 * @export
 * @class Reddit
 */
export default class Reddit {
    private R: any;
    private readonly UserAgent = "windows:ListenToThis2Spotify:v1.0.0 (by /u/jomagus)";

    constructor(RedditConfig: IRedditConfig) {
        const Snoowrap = require("snoowrap");

        this.R = new Snoowrap({
            userAgent: this.UserAgent,
            ...RedditConfig
        });
    }

    /**
     * Liefert die Hot Titles aus "/r/ListenToThis" geparst.
     *
     * @returns {(Bluebird<[string, string, string | undefined][]>)}Array mit Hot Posts sind Tripel der Form `[Title, Artist, Year]`
     * @memberof Reddit
     */
    GetSongList(): Bluebird<[string, string, string | undefined][]> {
        return this.GetPostTitles("listentothis").then((Titles) => {
            return Titles.map(this.ParseTitle);
        }).then(compact);
    }

    /**
     * Liefert die Titel der Hot Posts aus einem Subreddit.
     *
     * @param {string} Subreddit Das Subreddit das durchsucht werden soll.
     * @returns {Bluebird<string[]>} Array mit Titeln der Hot Posts.
     * @memberof Reddit
     */
    GetPostTitles(Subreddit: string): Bluebird<string[]> {
        return this.R.getSubreddit(Subreddit)
            .getHot()
            .map(post => post.title);
    }

    /**
     * Parsed einen Titel der Form des "/r/ListenToThis" Subreddits.
     *
     * @param {string} Raw Roher Titel
     * @returns {([string, string, string | undefined] | undefined)} Tripel der Form `[Title, Artist, Year]`
     * @memberof Reddit
     */
    ParseTitle(Raw: string): [string, string, string | undefined] | undefined {
        const RegEx = /([^-]+)-+([^\[]+)[^(]*(\(\d{4}\))?/;
        const Ret = RegEx.exec(Raw);

        if (!Ret) {
            return undefined;
        }

        const Artist = trim(Ret[1]);
        const Title = trim(Ret[2]);
        const Year = Ret[3] ? Ret[3].slice(1, -1) : undefined;

        if (Title === undefined || Artist === undefined) {
            return undefined;
        }

        return [Title, Artist, Year];
    }
}
