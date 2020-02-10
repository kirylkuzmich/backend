const JiraUser = require(global.__base + "jira/JiraUser");
const JiraProject = require(global.__base + "jira/JiraProject");
const JiraIssue = require(global.__base + "jira/JiraIssue");
const JiraWorkLogs = require(global.__base + "jira/JiraWorklogs");
const JiraRole = require(global.__base + "jira/JiraRole");
const JiraTempoWorklogs = require(global.__base + "jira/JiraTempoWorkLog");

module.exports = class JiraApi {
    /**
     * Constructor Jira-API
     * @param {JiraService} oJiraService
     * @param {JiraService} oTempoService
     */
    constructor(oJiraService, oTempoService) {
        this._jiraService = oJiraService;
        this._jiraUser = new JiraUser(oJiraService);
        this._jiraProject = new JiraProject(oJiraService);
        this._jiraIssue = new JiraIssue(oJiraService);
        this._jiraWorkLogs = new JiraWorkLogs(oJiraService);
        this._jiraRole = new JiraRole(oJiraService);
        this._jiraTempoWorkLogs = new JiraTempoWorklogs(oTempoService);
    }


    getCredentials() {
        return this._jiraService.getCredentials();
    }

    /**
     * Method to read all users int the system
     * Maximum user for one request - unknown
     * @returns {Promise<AxiosResponse<User>>}
     */
    getAllUsers() {
        return this._jiraUser.getAllUsers();
    }

    /**
     * Method to get user by User ID or email or name
     * @param {string}  sUserName
     * @returns {Promise<AxiosResponse<User>>}
     */
    getUser(sUserName) {
        return this._jiraUser.getUser(sUserName);
    }

    /**
     * Method to get user by user ID
     * @param {string}  sUserID - user id
     * @returns {Promise<AxiosResponse<User>>}
     */
    getUserByID(sUserID) {
        return this._jiraUser.getUserByID(sUserID);
    }

    /**
     * Method to get information about current user
     * @returns {Promise<AxiosResponse<User>>}
     */
    getCurrentUser() {
        return this._jiraUser.getCurrentUser();
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
        return this._jiraUser.getUsersByProjects(sProjectKeys, nStartAt, nMaxResults);
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
        return this._jiraUser.getUsersByIssue(issueKey, nStartAt, nMaxResults);
    }

    /**
     * Get WorkLogs by Array of IDs.
     * The returned list of Work Logs is limited to 1000 items.
     * @param {number[]} workLogsIDs
     * @return {Promise<AxiosResponse<WorkLog[]>>}
     */
    getWorkLogsByIDs(workLogsIDs) {
        return this._jiraWorkLogs.getWorkLogsByIDs(workLogsIDs);
    }

    /**
     * Method to read WorkLogs by Issue Key
     * @param {string} sIssuedKey
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @return {Promise<Promise<AxiosResponse<WorkLog>>[]>}
     */
    getWorkLogsByIssueKey(sIssuedKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraWorkLogs.getWorkLogsByIssueKey(sIssuedKey, nStartAt, nMaxResults);
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {number} nStartAt
     * @param {number | null} nMaxResults
     * @param {string | null} sExpand - expand option for project. Example: "lead,url"
     * @return {Promise<Promise<AxiosResponse<Project>>[]>}
     */
    getAllProject(nStartAt = 0, nMaxResults = null, sExpand = null) {
        return this._jiraProject.getAllProject(nStartAt, nMaxResults, sExpand);
    }

    /**
     * Method to get project by Project Key or ID
     * @param {string} sProjectID
     * @param {string | null} sExpand - expand option for project. Example: "lead,url"
     * @return {Promise<AxiosResponse<Project>>}
     */
    getProjectByID(sProjectID, sExpand = null) {
        return this._jiraProject.getProjectByID(sProjectID, sExpand);
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
        return this._jiraIssue.getIssuesByProject(sProjectID, sFields, nStartAt, nMaxResults);
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
        return this._jiraIssue.getIssuesByUser(sUserID, sFields, nStartAt, nMaxResults);
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
        return this._jiraIssue.getIssueByProjectAndUser(sProjectID, sUserID, sFields, nStartAt, nMaxResults);
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {string} sProject - Project ID or Key. Case sensitive
     * @return {Promise<AxiosResponse<Role[]>>}
     */
    getRolesByProject(sProject) {
        return this._jiraRole.getRolesByProject(sProject);
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {string} sProject - Project ID or Key. Case sensitive
     * @param {string} sRoleID - Role ID
     * @return {Promise<AxiosResponse<RoleActor>>}
     */
    getRoleActorsByRoleAndProject(sProject, sRoleID) {
        return this._jiraRole.getRoleActorsByRoleAndProject(sProject, sRoleID);
    }

    /**
     * Get WorkLogs by Project Key.
     * The returned list of Work Logs is limited to 1000 items.
     * @return {Promise<AxiosResponse<Promise<WorkLog[]>>>}
     * @param {number} [nStartAt=0]
     * @param {number | null} [nMaxResults=null]
     * @param {string} sProjectKey - user key
     */
    getWorkLogsByProject(sProjectKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraTempoWorkLogs.getWorkByLogsProject(sProjectKey, nStartAt, nMaxResults);
    }

    /**
     * Method to read WorkLogs by Issue Key
     * @param {string} sWorkLogKey
     * @param {number} [nStartAt=0]
     * @param {number | null} [nMaxResults=null]
     * @return {Promise<AxiosResponse<WorkLog>>}
     */
    getWorkLogsByKey(sWorkLogKey, nStartAt = 0, nMaxResults = null) {
        return this._jiraTempoWorkLogs.getWorkLogsByKey(sWorkLogKey, nStartAt, nMaxResults);
    }
};
