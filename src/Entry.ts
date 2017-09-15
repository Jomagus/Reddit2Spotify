import * as Bluebird from "bluebird";
import { compact } from "lodash";

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

    Bluebird.all(SpotifyUriList)
        .then(compact)
        .then((Tracks) => {
            SpotifyConnector.AddToPlaylist(SpotifyConfig.PlaylistId, Tracks);
        });
};

Main();
