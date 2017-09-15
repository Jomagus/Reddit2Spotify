interface IRedditConfig {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
}

interface ISpotifyConfig {
    clientId: string;
    clientSecret: string;
    refresh_token: string;
    PlaylistId: string;
    Username: string;
}

export { IRedditConfig, ISpotifyConfig };
