module.exports = class JiraRole {
    /**
     * Typedef block
     * @typedef Role{Object}
     * @property {string} self - HATEOAS of role for project
     * @property {string} name - name of role
     * @property {string} - id of role
     * @property {string} - description
     *
     * @typedef ActorUser{Object}
     * @property {string} accountId - account ID
     *
     * @typedef ActorGroup{Object}
     * @property {string} name - name of group
     * @property {string} displayName - display name of group
     *
     * @typedef RoleActor{Object}
     * @property {string} - id of role
     * @property {string} displayName - name of Actor
     * @property {string} type - type of Actor
     * @property {ActorUser | ActorGroup} [actorUser/actorGroup]
     */

    /**
     * Constructor Jira-Project-API
     * @param {JiraService} jiraService
     */
    constructor(jiraService) {
        this._jiraService = jiraService;
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {string} sProject - Project ID or Key. Case sensitive
     * @return {Promise<AxiosResponse<Role[]>>}
     */
    getRolesByProject(sProject) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/project/${sProject}/roledetails/`, sMethod: "GET",
            bSingleEntity: true
        });
    }

    /**
     * Method to read all accessible projects accessible by user
     * @param {string} sProject - Project ID or Key. Case sensitive
     * @param {string} sRoleID - Role ID
     * @return {Promise<AxiosResponse<RoleActor>>}
     */
    getRoleActorsByRoleAndProject(sProject, sRoleID) {
        return this._jiraService.sendRequest({
            sUrl: `/rest/api/3/project/${sProject}/role/${sRoleID}`, sMethod: "GET",
            bSingleEntity: true
        });
    }
};
