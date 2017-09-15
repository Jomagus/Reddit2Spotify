import * as Bluebird from "bluebird";
import { compact, difference } from "lodash";

import Reddit from "./Reddit";
import Spotify from "./Spotify";
import { RedditConfig, SpotifyConfig } from "./Config";

const Main = async () => {
    const RedditConnector = new Reddit(RedditConfig);
    const SpotifyConnector = new Spotify(SpotifyConfig);

    const SongList = await RedditConnector.GetSongList();

    const SpotifyUriList = SongList.map(
        ([Title, Artist, Year]) => SpotifyConnector.SearchTrack(Title, Artist, Year)
    );

    const InPlayList = SpotifyConnector.GetPlayListTracks(SpotifyConfig.PlaylistId);

    Bluebird.all(SpotifyUriList)
        .then(compact)
        .then(async (NewUris) => difference(NewUris, await InPlayList))
        .then((Tracks) => {
            if (Tracks.length === 0) return; // Keine neuen Tracks
            SpotifyConnector.AddToPlaylist(SpotifyConfig.PlaylistId, Tracks);
        });
};

Main();
