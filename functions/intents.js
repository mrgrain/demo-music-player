'use strict';

/**
 *
 * @param {Handover} handover
 * @param {Player} player
 * @return {Map<any, any>}
 */
module.exports = function (handover, player) {
    return new Map([
        ['Fallback', handover.handBack.bind(handover)],
        // ['Authorize Spotify', authorizeSpotify],
        ['Play artist', player.playArtist.bind(player)],
        ['Play album', player.playAlbum.bind(player)],
    ]);
};
