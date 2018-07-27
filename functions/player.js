'use strict';

/**
 * Class that handles player actions with spotify
 */
class Player {

    /**
     *
     * @param {WebhookClient} agent
     * @param {SpotifyWebApi} spotify
     *
     */
    constructor(agent, spotify) {
        /**
         * @type WebhookClient
         * @private
         */
        this._agent = agent;
        /**
         * @type SpotifyWebApi
         * @private
         */
        this._spotify = spotify;
    }

    /**
     * Play a spotify uri.
     *
     * @param {Object} item
     * @param {RichResponse} response
     *
     * @return {Promise}
     */
    play(item, response) {
        console.log(item);
        return this._spotify
                   .play({ context_uri: item.uri })
                   .then(() => response)
                   .catch(error => {
                       if (error.statusCode === 403) {
                           return 'You have to be Premium to play music. Click here to upgrade your account: https://www.spotify.com/nz/premium/?checkout=true';
                       }
                       if (error.statusCode === 404) {
                           return `I couldn't find any device to play on. Click here to play in web: ${item.external_urls.spotify}`;
                       }
                       throw error;
                   });
    }

    /**
     *
     * @return {Promise}
     */
    playArtist() {
        const artist = this._agent.parameters.artist;

        return this._spotify.searchArtists(artist)
                   .then(data => data.body.artists)
                   .then(artists => {
                       if (artists.total <= 0) {
                           return `I couldn't find any songs for ${artist}. Maybe try something else?`;
                       }

                       return Promise.resolve(artists.items.shift())
                                     .then(artist => [artist, `Playing ${artist.name}`])
                                     .then(parameters => this.play(...parameters));
                   })
                   .then(response => this._agent.add(response));
    }

    /**
     *
     * @return {Promise}
     */
    playAlbum() {
        const album = this._agent.parameters.album;

        return this._spotify.searchAlbums(album)
                   .then(data => data.body.albums)
                   .then(albums => {
                       if (albums.total <= 0) {
                           return `I couldn't find the album ${album}. Maybe try something else?`;
                       }

                       return Promise.resolve(albums.items.shift())
                                     .then(album => [album, `Playing ${album.name} by ${album.artists.shift().name}`])
                                     .then(parameters => this.play(...parameters));
                   })
                   .then(response => this._agent.add(response));
    }
}

module.exports = Player;
