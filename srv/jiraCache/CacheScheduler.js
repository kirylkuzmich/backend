"use strict";

/**
 * @typedef {Object} ScheduleOption
 * @property {number} nSchedulerPeriod
 */
/**
 * @typedef {Object} ServiceCredential
 * @property {JiraCredentials} oJiraCredential
 * @property {JiraCredentials} oTempoCredential
 */
/**
 * @typedef {Object} JiraReplicationSetting
 * @property {ScheduleOption} oScheduleOption
 * @property {ServiceCredential} oServiceCredential
 */

const fs = require("fs");

module.exports = class CacheManager {
    /**
     * Start Jira Cache Initialization process
     * @param {string} sJiraReplicationOptionFilePath - settings file path
     */

    static jiraCacheInit(sJiraReplicationOptionFilePath) {
        fs.readFile(sJiraReplicationOptionFilePath, {encoding: "UTF-8"},
            /**
             * Replication parse and change settings of jira cache scheduler
             * @param {string} oError - error of read
             * @param {string} sJiraReplicationOption - settings in JSON format
             */
            (oError, sJiraReplicationOption) => {
                /** @type {JiraReplicationSetting} */
                if (!oError) {

                    const oJiraReplicationOption = JSON.parse(sJiraReplicationOption);

                    try {
                        require(global.__base + "jiraCache/worker/MainCacheThread")(
                            oJiraReplicationOption.oServiceCredential.oJiraCredential,
                            oJiraReplicationOption.oServiceCredential.oTempoCredential
                        );
                    } catch (err) {
                        // console.log(err);
                        //todo add logging statement
                    }
                    setTimeout(() => {
                        CacheManager.jiraCacheInit(sJiraReplicationOptionFilePath);
                    }, oJiraReplicationOption.oScheduleOption.nSchedulerPeriod || 3600000);
                }
                // Temporary solution before we solve the problem with storing the settings
                //else {
                //throw oError;
                //}
            });
    }
};
