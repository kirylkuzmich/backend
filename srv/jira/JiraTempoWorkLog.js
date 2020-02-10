module.exports = class JiraTempoWorkLog {
    /**
     * @typedef WorkLog {{...}}
     * Constructor Jira-WorkLog-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Get WorkLogs by Project Key.
     * The returned list of Work Logs is limited to 1000 items.
     * @return {Promise<AxiosResponse<Promise<WorkLog[]>>>}
     * @param {number} [nStartAt=0]
     * @param {number | null} [nMaxResults=null]
     * @param {string} sProjectKey - user key
     */
    getWorkByLogsProject(sProjectKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/core/3/worklogs/project/${sProjectKey}`, sMethod: "GET",
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            nAPIMaxResults: 1000,
            bSingleEntity: false,
            bTotalExist: false,
            sEntityName: "results",
            sLimitParamName: "limit",
            sOffsetParamName: "offset",
        });
    }

    /**
     * Method to read WorkLogs by Issue Key
     * @param {string} sWorkLogKey
     * @param {number} [nStartAt=0]
     * @param {number | null} [nMaxResults=null]
     * @return {Promise<AxiosResponse<WorkLog>>}
     */
    getWorkLogsByKey(sWorkLogKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraService.sendRequest({
            sUrl: `/core/3/worklogs/${sWorkLogKey}`, sMethod: "GET",
            nStartAt: nStartAt,
            nUserRequestedMaxResults: nMaxResults,
            bSingleEntity: true,
            bTotalExist: false,
        });
    }
};
