'use strict';

const functions = require('firebase-functions');
const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
    /**
     *
     * @return {Promise<SpotifyWebApi>}
     */
    connect: function () {
        console.debug('Connection to Spotify');
        const spotify = new SpotifyWebApi({
            clientId: functions.config().spotify.client_id,
            clientSecret: functions.config().spotify.client_secret,
            redirectUri: functions.config().spotify.redirect_uri
        });
        spotify.setRefreshToken(functions.config().spotify.refresh_token);

        return new Promise((resolve, reject) => {
            if (spotify.getAccessToken()) {
                return resolve(spotify);
            }

            return spotify
                .refreshAccessToken()
                .then(data => {
                    spotify.setAccessToken(data.body['access_token']);
                    resolve(spotify);
                })
                .catch(reject);
        })
    }
};
