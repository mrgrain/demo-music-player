'use strict';

/**
 * Class that handles player actions with spotify
 */
class Handover {

    /**
     *
     * @param {WebhookClient} agent
     * @param {ZwermAPI} zwerm
     *
     */
    constructor(agent, zwerm) {
        /**
         * @type WebhookClient
         * @private
         */
        this._agent = agent;
        /**
         * @type ZwermAPI
         * @private
         */
        this._zwerm = zwerm;
        /**
         * @type Object
         * @private
         */
        this._data = agent.originalRequest.payload.zwerm;
        if (this.zwermRequest) {
            this._data.userId = (this._data.botUserId || '').split('.').slice(1).join('.');
            this._data.team = process.env.ZWERM_TEAM;
        }
    }

    zwermRequest() {
        return !!this._data;
    }

    /**
     *
     * @return {Promise}
     */
    takeOver() {
        if (!this.zwermRequest()) {
            return Promise.resolve(this._agent.clearOutgoingContexts().add(''));
        }

        return this._zwerm.putCurrentRouteForCoversation(
            this._data.team,
            this._data.channel.botId,
            this._data.userId,
            this._data.conversationId,
            `${this._data.team}/${this._data.channel.botId}/${process.env.ENGINE_ID}`
        ).then(() => this._agent.clearOutgoingContexts().add(''));
    }

    /**
     *
     * @return {Promise}
     */
    handBack() {
        if (!this.zwermRequest()) {
            return Promise.resolve(this._agent.clearOutgoingContexts().add(''));
        }

        return this._zwerm.postEventToConversation(
            this._data.team,
            this._data.channel.botId,
            this._data.botUserId.split('.').slice(1).join('.'),
            this._data.conversationId,
            'zwerm.handover',
            {
                query: this._agent.query
            },
            {
                route: `${this._data.team}/${this._data.channel.botId}`
            }
        ).then(() => this._agent.clearOutgoingContexts().add(''));
    }
}

module.exports = Handover;
