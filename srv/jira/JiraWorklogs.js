module.exports = class JiraWorkLogs {
    /**
     * @typedef WorkLog {{...}}
     * Constructor Jira-WorkLog-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Get WorkLogs by Array of IDs.
     * The returned list of Work Logs is limited to 1000 items.
     * @param {number[]} workLogsIDs
     * @return {Promise<AxiosResponse<WorkLog[]>>}
     */
    getWorkLogsByIDs(workLogsIDs) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/worklog/list`, sMethod: "POST",
            nAPIMaxResults: 1000,
            oData: {ids: workLogsIDs},
            bSingleEntity: true,
            bTotalExist: false,
        });
    }

    /**
     * Method to read WorkLogs by Issue Key
     * @param {string} sIssuedKey
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @return {Promise<Promise<AxiosResponse<WorkLog>>[]>}
     */
    getWorkLogsByIssueKey(sIssuedKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/issue/${sIssuedKey}/worklog`, sMethod: "GET",
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            nAPIMaxResults: 1048576,
            bSingleEntity: false,
            bTotalExist: false,
            sEntityName: "worklogs"
        });
    }
};
