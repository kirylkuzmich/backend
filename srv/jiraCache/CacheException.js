module.exports = class CacheException extends Error {
    /**
     * @constructor
     * @param {string} sMessage
     */
    constructor(sMessage) {
        super();
        this.sMessage = sMessage;
    }
};
