import * as Bluebird from "bluebird";

import { ISpotifyConfig } from "./IConfig";

export default class Spotify {
    private S: any;
    public IsReady: Bluebird<any>;

    constructor(SpotifyConfig: ISpotifyConfig) {
        const SpotifyWebApi = require("spotify-web-api-node");
        this.S = new SpotifyWebApi(SpotifyConfig);
        this.IsReady = this.S.clientCredentialsGrant().then((Data) => {
            this.S.setAccessToken(Data.body["access_token"]);
        });
        // this.S.setAccessToken("<your_access_token>");
    }

    SearchTrack(Title: string, Artist: string, Year?: string): Bluebird<string> {
        let SearchString = `track:${Title} artist:${Artist}`;
        if (Year) {
            SearchString += ` year:${Year}`;
        }
        return this.S.searchTracks(SearchString).then((Answer) => {
            const Tracks = Answer.body.tracks;
            if (!Tracks.items[0]) return undefined;
            return Tracks.items[0].uri;
        });
    }
}
