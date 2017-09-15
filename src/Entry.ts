import * as Bluebird from "bluebird";
import { compact, difference } from "lodash";

import Reddit from "./Reddit";
import Spotify from "./Spotify";
import { RedditConfig, SpotifyConfig } from "./Config";

const Main = async () => {
    // Verbinde mit Platformen
    const RedditConnector = new Reddit(RedditConfig);
    const SpotifyConnector = new Spotify(SpotifyConfig);

    // Hole Hot Titles aus /r/ListenToThis
    const SongList = await RedditConnector.GetSongList();

    // Suche diese Titel auf Spotify
    const SpotifyUriList = SongList.map(
        ([Title, Artist, Year]) => SpotifyConnector.SearchTrack(Title, Artist, Year)
    );

    // Schaue welche Titel schon in der Playlist sind
    const InPlayList = SpotifyConnector.GetPlayListTracks(SpotifyConfig.PlaylistId);

    // Füge noch nicht vorhandene Titel der Playlist hinzu
    Bluebird.all(SpotifyUriList)
        .then(compact)
        .then(async (NewUris) => difference(NewUris, await InPlayList))
        .then((Tracks) => {
            if (Tracks.length === 0) return; // Keine neuen Tracks
            SpotifyConnector.AddToPlaylist(SpotifyConfig.PlaylistId, Tracks);
        });
};

Main();
