const CCacheException = require("../CacheException");

module.exports = class CacheWorkerException extends CCacheException {
    constructor(sMessage){
        super(sMessage);
    }
};
