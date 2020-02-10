module.exports = class JiraProject {
    /**
     * @typedef Project{{...}}
     * Constructor Jira-Project-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @param {string | null} sExpand - expand option for project. Example: "lead,url"
     * @return {Promise<Promise<AxiosResponse<Project>>[]>}
     */
    getAllProject(nStartAt = 0, nMaxResults = null, sExpand = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/project/search/`, sMethod: "GET",
            nStartAt: nStartAt,
            oRequestParams: {expand: sExpand},
            nUserRequestedMaxResults: nMaxResults,
            nAPIMaxResults: 50,
            bSingleEntity: false,
            bTotalExist: true,
            sEntityName: "values"
        });
    }

    /**
     * Method to get project by Project Key or ID
     * @param {string} sProjectID
     * @param {string | null} sExpand - expand option for project. Example: "lead,url"
     * @return {Promise<AxiosResponse<Project>>}
     */
    getProjectByID(sProjectID, sExpand = null) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/project/search/`, sMethod: "GET",
            oRequestParams: {projectID: sProjectID, expand: sExpand},
            nAPIMaxResults: 50,
            bSingleEntity: true,
            bTotalExist: true,
            sEntityName: "values"
        });
    }
};
