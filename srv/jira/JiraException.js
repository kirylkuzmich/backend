module.exports = class JiraException extends Error{
    constructor(message) {
        super();
        this.message = message;
    }
};
