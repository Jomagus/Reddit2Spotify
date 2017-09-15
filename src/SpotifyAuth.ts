import * as Bluebird from "bluebird";

import { SpotifyConfig } from "./Config";

const SpotifyWebApi = require("spotify-web-api-node");

const RedirectUrl = "http://spotify.jomagus.de/auth/";

const S = new SpotifyWebApi({
    clientId: SpotifyConfig.clientId,
    clientSecret: SpotifyConfig.clientSecret,
    redirectUri: RedirectUrl,
});

const AuthStep1 = async () => {
    const Scopes = ["playlist-read-private", "playlist-modify-private"];
    const State = SpotifyConfig.State ? SpotifyConfig.State : "";

    const AuthorizeUrl = S.createAuthorizeURL(Scopes, State);

    const Readline = require("readline");
    const RLI = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Bluebird<string>((Resolve) => {
        RLI.question(`Rufe diese URL auf:\n\n${AuthorizeUrl}\n\nKopiere dann das Code Segment hierhin:\n`, (Answer) => {
            Resolve(Answer);
            RLI.close();
        });
    });
};

const ListPlaylists = async () => {
    S.getUserPlaylists(SpotifyConfig.Username)
        .then((Data) => {
            console.log("Suche dir die Id deiner Playlist heraus und kopiere diese nach SpotifyConfig[\"PlaylistId\"]");
            console.log();
            Data.body.items.forEach(({ id, name }) => {
                console.log(`Name:${name}\nId: ${id}\n\n`);
            });
        });
};

// TODO: Playlist listing für auswahl der gewünschten Id

const Auth = async () => {
    const Code = await AuthStep1();
    const Data = await S.authorizationCodeGrant(Code);

    console.log("\nKopiere dieses Token in SpotifyConfig[\"refresh_token\"]:\n\n");
    console.log(Data.body["refresh_token"]);
    console.log();

    // Set the access token on the API object to use it in later calls
    S.setAccessToken(Data.body["access_token"]);
    S.setRefreshToken(Data.body["refresh_token"]);

    ListPlaylists();
};

Auth();
