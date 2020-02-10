module.exports = class JiraUser {
    /**
     @typedef User {{...}}
     * Constructor Jira-User-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Method to read all users int the system
     * Maximum user for one request - unknown
     * @returns {Promise<AxiosResponse<User[]>>}
     */
    getAllUsers() {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/users/search`, sMethod: "GET",
            bSingleEntity: false,
            nAPIMaxResults: 0x7FFFFFFF,
        });
    }

    /**
     * Method to get user by username
     * @param {string}  sUserName
     * @returns {Promise<AxiosResponse<User>>}
     */
    getUser(sUserName) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/user/search`, sMethod: "GET",
            oRequestParams: {username: sUserName},
            bSingleEntity: true
        });
    }

    /**
     * Method to get user by user ID
     * @param {string}  sUserID
     * @returns {Promise<AxiosResponse<User>>}
     */
    getUserByID(sUserID) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/user/search`, sMethod: "GET",
            oRequestParams: {accountId: sUserID},
            bSingleEntity: true
        });
    }

    /**
     * Method to get information about current user
     * @returns {Promise<AxiosResponse<User>>}
     */
    getCurrentUser() {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/myself?`, sMethod: "GET",
            bSingleEntity: true
        });
    }

    /**
     * Method to get users by Project Keys
     * Max returning values for one request - 1000
     * @param {string} sProjectKeys. Example: "PROG1, PROG2"
     * @param {number} nStartAt = 0
     * @param {number | null} nMaxResults
     * @returns {Promise<Promise<AxiosResponse<User>>[]>}
     */
    getUsersByProjects(sProjectKeys, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/user/assignable/multiProjectSearch/`, sMethod: "GET",
            nAPIMaxResults: 1000,
            oRequestParams: {projectKeys: sProjectKeys},
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            bSingleEntity: false
        });
    }

    /**
     * Method to get users by Issues Key
     * Max returning values for one request - 1000
     * @param {string} issueKey
     * @param {number} nStartAt = 0
     * @param {number | null} nMaxResults
     * @returns {Promise<Promise<AxiosResponse<User>>[]>}
     */
    getUsersByIssue(issueKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/user/assignable/search`, sMethod: "GET",
            nAPIMaxResults: 1000,
            oRequestParams: {issueKey: issueKey},
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            bSingleEntity: false
        });
    }
};
