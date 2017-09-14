import Reddit from "./Reddit";
import { RedditConfig } from "./Config";

const RedditConnector = new Reddit(RedditConfig);

RedditConnector.GetSongList().then((List) => {
    List.forEach(
        ([Title, Artist, Year]) => console.log(`Titel: ${Title}\nArtist: ${Artist}\nYear: ${Year}\n`)
    );
});
