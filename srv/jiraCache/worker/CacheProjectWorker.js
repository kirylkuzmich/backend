// const {performance} = require("perf_hooks");
/**
 * @typedef {Object} WorkerData
 * @property {JiraCredentials} oJiraCredentials
 * @property {JiraCredentials} oTempoCredentials
 * @property {CacheProject} oSerializedProject
 * This file provide functionality for Node JS worker
 */


global.__base = `${__dirname}/../../`;
/**
 * In worker data should be passed following Object
 * @type {WorkerData}
 */
const oWorkerData = require("worker_threads").workerData;
const JiraApi = require(global.__base + "jira/JiraApi");
const JiraService = require(global.__base + "jira/JiraService");
const JiraCache = require(global.__base + "jiraCache/CacheManager");
const DataSerializer = require(global.__base + "jiraCache/DataSerializer");
const CacheDataParser = require(global.__base + "jiraCache/CacheDataParser");
const CacheWorkerException = require(global.__base + "jiraCache/worker/CacheWorkerException");
// const CacheStatistics = require(global.__base + "jiraCache/CacheStatistics");
const {isMainThread, parentPort} = require("worker_threads");

(async () => {
        if (isMainThread) {
            throw CacheWorkerException("Impossible to use this thread as main");
        } else {
            // console.log(performance.now());
            //statistic part
            // CacheStatistics.startTrackMeasurePerformance();
            // const sMarkStartName = `${threadId}Start`;
            // const sMarkFinishName = `${threadId}Finish`;
            // performance.mark(sMarkStartName);

            const oJiraCacheManager = new JiraCache(new JiraApi(
                new JiraService(
                    oWorkerData.oJiraCredentials.sBaseUrl,
                    oWorkerData.oJiraCredentials.oBasicAuth,
                    oWorkerData.oJiraCredentials.sToken,
                    oWorkerData.oJiraCredentials.sSystemId
                ),
                new JiraService(
                    oWorkerData.oTempoCredentials.sBaseUrl,
                    oWorkerData.oTempoCredentials.oBasicAuth,
                    oWorkerData.oTempoCredentials.sToken,
                    oWorkerData.oTempoCredentials.sSystemId
                )),
                DataSerializer
            );

            Promise.all([
                oJiraCacheManager.getUserAssignmentByProject(oWorkerData.oSerializedProject),
                oJiraCacheManager.getReportedHours(oWorkerData.oSerializedProject)
            ])
                .then(aResults => {
                    parentPort.postMessage({
                        aUserAssignment: CacheDataParser.deleteDuplicatesAndEmptyEntries(aResults[0]),
                        aReportedHours: CacheDataParser.deleteDuplicatesAndEmptyEntries(aResults[1])
                    });
                    // performance.mark(sMarkFinishName);
                    // performance.measure(`
                    //     Duration of ${threadId} thread;
                    //     Current Memory Usage ${process.memoryUsage().heapUsed / 1024 / 1024}
                    // `, sMarkStartName, sMarkFinishName);
                    // CacheStatistics.endTrackMeasurePerformance();
                })
                .catch(oError=>{
                    //todo add logging
                    //console.log(oError);
                });
        }
    }
)();
