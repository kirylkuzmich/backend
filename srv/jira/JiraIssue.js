module.exports = class JiraIssue {
    /**
     * @typedef  Issue{{...}}
     * Constructor Jira-Issue-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Method to read Issue by ID or Key
     * @param {string} issueID
     * @param {string} fields
     * @return {Promise<AxiosResponse<Issue>>}
     */
    getIssue(issueID, fields = "") {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/issue/${issueID}/`, sMethod: "GET",
            oRequestParams: {fields: fields},
            bSingleEntity: true,
        });
    }

    /**
     * Get issues by Project ID
     * A comma-separated list of fields to return for each issue, use it to retrieve a subset of fields.
     * Example
     * summary,comment Returns the summary and comments fields only.
     * -description Returns all navigable (default) fields except description.
     * all,-comment Returns all fields except comments.
     * @param {string} sFields
     * @param {string} sProjectID
     * @param {number} nStartAt
     * @param {number | null} nMaxResults. Maximum - 100
     * @return {Promise<Promise<AxiosResponse<Issue>>[]>}
     */
    getIssuesByProject(sProjectID, sFields, nStartAt = 0, nMaxResults = null) {
        return this._generalGetIssues(`project = ${sProjectID}`, sFields, nStartAt, nMaxResults);
    }

    /**
     * Method returned assigned issues by UserID
     * @param {uuid} sUserID
     * @param {string} sFields
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @return {Promise<Promise<AxiosResponse<Issue>>[]>}
     */
    getIssuesByUser(sUserID, sFields, nStartAt = 0, nMaxResults = null) {
        return this._generalGetIssues(`assignee = ${sUserID}`, sFields, nStartAt, nMaxResults);
    }

    /**
     * Method returned assigned issues by User ID and Project ID
     * @param {string} sProjectID
     * @param {string} sUserID as UUID
     * @param {string} sFields
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @return {Promise<Promise<AxiosResponse<Issue>>[]>}
     */
    getIssueByProjectAndUser(sProjectID, sUserID, sFields, nStartAt = 0, nMaxResults = null) {
        return this._generalGetIssues(`project = ${sProjectID} AND assignee = ${sUserID}`, sFields, nStartAt, nMaxResults);
    }

    _generalGetIssues(sJQL, sFields, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/search/`, sMethod: "GET",
            oRequestParams: {jql: sJQL, fields: sFields,},
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            nAPIMaxResults: 100,
            bSingleEntity: false,
            bTotalExist: true,
            sEntityName: "issues"
        });
    }
};
