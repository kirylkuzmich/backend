"use strict";

module.exports = class CacheManager {

    /**
     * @param {JiraApi} oJiraApi
     * @param {DataSerializer} oDataSerializer
     */
    constructor(oJiraApi, oDataSerializer) {
        this._oJiraApi = oJiraApi;
        this._oDataSerializer = oDataSerializer;
    }

    /**
     * Get all project
     * @return {Promise<CacheProject[]>}
     * @public
     */
    getProjects() {
        return this._serializePromiseResponseArray(
            this._oJiraApi.getAllProject(0, null, "lead"),
            this._oDataSerializer.projectSerialize,
            "values"
        );
    }

    /**
     * Method return Cache Employees format
     * @return {Promise<Array<CacheEmployee>>}
     * @public
     */
    getUsers() {
        return this._serializePromiseResponseArray(
            this._oJiraApi.getAllUsers(),
            this._oDataSerializer.userSerialize
        );
    }

    /**
     *
     * @param {CacheProject} oProject
     * @returns {Promise<Array<Object>>}
     * @private
     */
    _getUsersByProject(oProject) {
        return this._serializePromiseResponseArray(
            this._oJiraApi.getUsersByProjects(oProject.externalId),
            this._oDataSerializer.userIDSerialize
        );
    }

    /**
     *
     * @param {CacheProject} oProject
     * @returns {Promise<Array<CacheReportedHours>>}
     * @public
     */
    async getReportedHours(oProject) {
        return this._serializePromiseResponseArray(
            this._oJiraApi.getWorkLogsByProject(oProject.externalId),
            this._oDataSerializer.worklogsSerialize,
            "results"
        );
    }

    /**
     * Get user-project assigment
     * @public
     * @param {CacheProject} oProject
     * @return {Promise<Array<CacheProjectAssignment>>}
     */
    async getUserAssignmentByProject(oProject) {

        return (await this._getUsersByProject(oProject)).map(oUser =>
            this._oDataSerializer.projectAssigmentSerialize(oProject, oUser)
        );
    }

    /**
     * General method for parse array of Response Objects
     * @param {Promise<Promise<AxiosResponse<Object>>[]>} oPromiseResponseArray
     * @param {function} fSerializeFunction - function serialization Object
     * @param {string} [sEntityName] - name of the Entity in Response Data of JIRA REST API
     * @return {Promise<Array<Object>>}
     * @protected
     */
    async _serializePromiseResponseArray(oPromiseResponseArray, fSerializeFunction, sEntityName) {
        return (await Promise.all(await oPromiseResponseArray))
            .map(oResponse =>
                (sEntityName ? oResponse.data[sEntityName] : oResponse.data)
                    .map(oJiraEntity => fSerializeFunction(oJiraEntity))
            )
            //flat array; method "flat" for array added only since Node JS 11.0
            .reduce((arr, val) => arr.concat(val), []);
    }
};
