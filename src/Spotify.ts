import * as Bluebird from "bluebird";

import { ISpotifyConfig } from "./IConfig";

/**
 * Liefert gekapselt unsere Methoden um mit Spotify zu interagieren.
 *
 * @export
 * @class Spotify
 */
export default class Spotify {
    /**
     * Initialisiertes "spotify-web-api-node" Objekt.
     *
     * @private
     * @type {*}
     * @memberof Spotify
     */
    private S: any;
    /**
     * Konfigurierter Nutzername des Scriptusers in Spotify.
     *
     * @private
     * @type {string}
     * @memberof Spotify
     */
    private Username: string;
    /**
     * Promise die wenn sie fullfilled ist gültige Spotify OAuth2 Cerbindung signalisiert.
     *
     * @private
     * @type {Bluebird<void>}
     * @memberof Spotify
     */
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

    /**
     * Refreshed das OAuth2 Access Token mithilfe des konfigurierten
     * Refresh Tokesn.
     *
     * @private
     * @returns {Bluebird<void>} Promise die fullfilles wenn Refresh abgeschlossen.
     * @memberof Spotify
     */
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

    /**
     * Sucht einen Track auf Spotify.
     *
     * @param {string} Title Titel des Tracks.
     * @param {string} Artist Künstler des Tracks.
     * @param {string} [Year] Optionales Jahr des Tracks.
     * @returns {Bluebird<string>} Track URI oder undefined wenn keiner gefunden wurde.
     * @memberof Spotify
     */
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

    /**
     * Liefert die ersten 100 Track URIs der gegebenen Playlist.
     *
     * @param {string} PlaylistId Id der Playlist.
     * @returns {Bluebird<string[]>} Array mit bis zu 100 Track URIs der Playlist.
     * @memberof Spotify
     */
    async GetPlayListTracks(PlaylistId: string): Bluebird<string[]> {
        await this.IsReady;

        const Playlist = await this.S.getPlaylist(this.Username, PlaylistId);
        const Tracks = Playlist.body.tracks.items.map((PlaylistEntry) => PlaylistEntry.track.uri);
        return Tracks;
    }

    /**
     * Fügt eine Reihe von Tracks am Anfang der gegebenen Playlist hinzu.
     *
     * @param {string} PlaylistId Id der Playlist.
     * @param {string[]} TrackUris Array mit Track URIs.
     * @memberof Spotify
     */
    async AddToPlaylist(PlaylistId: string, TrackUris: string[]) {
        await this.IsReady;

        this.S.addTracksToPlaylist(this.Username, PlaylistId, TrackUris, { position: 0 })
            .then((data) => {
                console.log("Added tracks to playlist!");
            });
    }
}
