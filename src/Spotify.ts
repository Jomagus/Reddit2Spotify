import * as Bluebird from "bluebird";

import { ISpotifyConfig } from "./IConfig";

/**
 * Liefert gekapselt unsere Methoden um mit Spotify zu interagieren.
 *
 * @export
 * @class Spotify
 */
export default class Spotify {
    private S: any;
    private Username: string;
    private IsReady: Bluebird<void>;

    constructor(SpotifyConfig: ISpotifyConfig) {
        this.Username = SpotifyConfig.Username;

        const SpotifyWebApi = require("spotify-web-api-node");
        this.S = new SpotifyWebApi({
            clientId: SpotifyConfig.clientId,
            clientSecret: SpotifyConfig.clientSecret
        });

        this.S.setRefreshToken(SpotifyConfig.refresh_token);
        this.RefreshToken();
    }

    private async RefreshToken(): Bluebird<void> {
        this.IsReady = this.S.refreshAccessToken().then((Data) => {
            this.S.setAccessToken(Data.body["access_token"]);
            console.log("Access Token Refresh Success");
        }
        ).catch((Error) => {
            console.log("Access Token Refresh Failed");
            console.log(Error);
        });
    }

    async SearchTrack(Title: string, Artist: string, Year?: string): Bluebird<string> {
        await this.IsReady;

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

    async AddToPlaylist(PlaylistId: string, TrackUris: string[]) {
        await this.IsReady;

        this.S.addTracksToPlaylist(this.Username, PlaylistId, TrackUris)
            .then((data) => {
                console.log("Added tracks to playlist!");
            });
    }
}
