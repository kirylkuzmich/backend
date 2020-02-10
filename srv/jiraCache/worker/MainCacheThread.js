"use strict";
require('events').EventEmitter.defaultMaxListeners = 1000;
const {Worker, isMainThread} = require('worker_threads');
// const {performance} = require('perf_hooks');

const JiraApi = require(global.__base + "jira/JiraApi");
const CacheManager = require(global.__base + "jiraCache/CacheManager");
const DataSerializer = require(global.__base + "jiraCache/DataSerializer");
const DataBaseWorker = require(global.__base + "jiraCache/DatabaseManager");
const JiraService = require(global.__base + "jira/JiraService");
const CacheWorkerException = require(global.__base + "jiraCache/worker/CacheWorkerException");
// const CacheStatistics = require(global.__base + "jiraCache/CacheStatistics");

const IGNORE_PROJECT_TYPE = require(global.__base + "jiraCache/CacheConstant").oObjectIgnoreFilter.oProject.TYPE;
const IGNORE_PROJECT_NAME = require(global.__base + "jiraCache/CacheConstant").oObjectIgnoreFilter.oProject.NAME;
const IGNORE_USER_TYPE = require(global.__base + "jiraCache/CacheConstant").oObjectIgnoreFilter.oUser.TYPE;

/**
 * @param oJiraCacheManager
 * @return {Promise<Array<>>}
 * @private
 */
async function _getAndSaveUser(oJiraCacheManager) {
    return DataBaseWorker.updateEmployeeTable((await oJiraCacheManager.getUsers()).filter(
        oUser => !IGNORE_USER_TYPE.has(oUser.accountType)));
}

/**
 * @param oJiraCacheManager
 * @return {Promise<*>}
 * @private
 */
async function _getAndSaveProject(oJiraCacheManager) {
    return DataBaseWorker.updateProjectTable((await oJiraCacheManager.getProjects()).filter(
        oProject => !IGNORE_PROJECT_NAME.has(oProject.externalId) && !IGNORE_PROJECT_TYPE.has(oProject.projectType)));
}

/**
 * Start of replication process
 * @param {JiraCredentials} oJiraCredentials
 * @param {JiraCredentials} oTempoCredentials
 * @return {Promise<void>}
 */
module.exports = async (oJiraCredentials, oTempoCredentials) => {
    if (isMainThread) {
        // CacheStatistics.startTrackMeasurePerformance();
        // performance.mark("Main start");

        const oJiraCacheManager = new CacheManager(new JiraApi(
            new JiraService(
                oJiraCredentials.sBaseUrl,
                oJiraCredentials.oBasicAuth,
                oJiraCredentials.sToken,
                oJiraCredentials.sSystemId
            ),
            new JiraService(
                oTempoCredentials.sBaseUrl,
                oTempoCredentials.oBasicAuth,
                oTempoCredentials.sToken,
                oTempoCredentials.sSystemId
            )),
            DataSerializer
        );

        // For correct processing user assignment to project we should get user data
        const [aSerializedUser, aSerializedProject] = await Promise.all([
            _getAndSaveUser(oJiraCacheManager),
            _getAndSaveProject(oJiraCacheManager)
        ]);
        //DataBaseWorker.workingWithDB();

        aSerializedProject.forEach(oSerializedProject => {
            const oWorker = new Worker(global.__base + "jiraCache/worker/CacheProjectWorker.js", {
                workerData: {
                    oJiraCredentials: oJiraCredentials,
                    oSerializedProject: oSerializedProject,
                    oTempoCredentials: oTempoCredentials
                }
            });
            oWorker.on("message", oProjectAssigmentData => {
                const aSerializedWorkLog = [];
                if (oProjectAssigmentData.aUserAssignment.length !== 0) {
                    Array.prototype.push.apply(aSerializedWorkLog, DataBaseWorker.updateAssignmentTable(
                        DataSerializer.mappingInternalUserIdToWorkLogs(
                            DataSerializer.mappingInternalProjectIdToWorkLog(oProjectAssigmentData.aUserAssignment, oSerializedProject),
                            aSerializedUser
                        )
                    ));
                }

                if (oProjectAssigmentData.aReportedHours.length !== 0) {
                    DataBaseWorker.updateProjectHoursTable(
                        DataSerializer.addProjectAssignmentsToReportedHoursSerialize(
                            oProjectAssigmentData.aReportedHours, aSerializedWorkLog));
                }
            });
        });

        // performance.mark("Main end");
        // performance.measure("Replication Initialization", "Main start", "Main end");
        // CacheStatistics.endTrackMeasurePerformance();
    } else {
        throw CacheWorkerException("This file cannot be used as child thread");
    }
};
