const promiseTimeout = require('promise-timeout');
const requestPromise = require('request-promise');

module.exports = class JiraDataService {
    constructor (sLogin, sPassword){
        this.requestPromise = requestPromise;
        this.promiseTimeout = promiseTimeout;
        this.getHeadersForUri = sUri => {
            return {
                method: "GET",
                uri: sUri,
                json: true,
                headers: {
                    "Authorization": "Basic " + Buffer.from(sLogin + ":" + sPassword).toString("base64")
                }
            };
        };
        this.oUris = {
            sProjects: "https://leverxeu.atlassian.net/rest/api/3/project/search?expand=lead&jql=&maxResults=1000",
            sEmployees: "https://leverxeu.atlassian.net/rest/api/3/user/search?username&maxResults=1000",
            getProjectRoles: sProjectId => `https://leverxeu.atlassian.net/rest/api/3/project/${sProjectId}/role`,
            getProjectIssuesWorkLogs: sProjectId => `https://leverxeu.atlassian.net/rest/api/3/search`
                +`?jql=project=${sProjectId}&fields=key,assignee,worklog&maxResults=1000&startAt=0`,
        };
    }

    async getRequest(Uri){
        let aResult = [];
        await this.promiseTimeout.timeout(this.requestPromise(this.getHeadersForUri(Uri)), 1000)
            .then(result => aResult = result)
            .catch(error => {
                if (error instanceof this.promiseTimeout.TimeoutError) {
                    console.dir('HTTP get timed out');
                }
            });
        return aResult;
    }

    async getProjects() {
        let aProjects = [];
        const oProjectsPromise = this.getRequest(this.oUris.sProjects);

        await Promise.all([oProjectsPromise])
            .then(oResults => {
                if (oResults[0] && oResults[0].values){
                    aProjects = oResults[0].values;
                }
            })
            .catch(oError => {
                console.dir(`ERROR: JiraDataService -> getProjects\n${oError.message}`);
            });

        return aProjects;
    }
    async getProjectRoles(sProjectId) {
        let oRoles = {};
        const oRolesPromise = this.getRequest(this.oUris.getProjectRoles(sProjectId));

        await Promise.all([oRolesPromise])
            .then(aResults => {
                oRoles = aResults[0] ? aResults[0] : {};
            })
            .catch(oError => {
                console.dir(`ERROR: JiraDataService -> getProjectRoles, id = ${sProjectId}\n${oError.message}`);
            });

        return oRoles;
    }
    async getProjectWorkLogs(sProjectId) {
        let aIssues = [];
        const oProjectIssuesWorkLogsPromise = this.getRequest(this.oUris.getProjectIssuesWorkLogs(sProjectId));
        await Promise.all([oProjectIssuesWorkLogsPromise])
            .then(aResults => {
                if (aResults[0] && aResults[0].issues){
                    aIssues = aResults[0].issues;
                }
            })
            .catch(oError => {
                console.dir(`ERROR: JiraDataService -> getProjectWorkLogs id = ${sProjectId}\n${oError.message}`);
            });

        return aIssues;
    }
    async getProjectMembersByRoles(aRolesUris){
        let aActors = [];

        for (let iIndex = 0; iIndex < aRolesUris.length; iIndex++){
            await Promise.all([this.getRequest(aRolesUris[iIndex])])
                .then(aResults => {
                    aActors = (aResults[0] && aResults[0].actors) ? aActors.concat(aResults[0].actors) : aActors;
                })
                .catch(oError => {
                    console.dir(`ERROR: JiraDataService -> getProjectMembersByRoles role uri = ${aRolesUris[iIndex]}\n${oError.message}`);
                });
        }

        return aActors;
    }

    async getEmployees(){
        let aEmployees = [];
        const oEmployeesPromise = this.getRequest(this.oUris.sEmployees);
        await Promise.all([oEmployeesPromise])
            .then(aResults => aEmployees = (aResults[0] && aResults[0].length) ? aResults[0] : [])
            .catch(oError => {
                console.dir(`ERROR: JiraDataService -> getEmployees \n${oError.message}`);
            });
        return aEmployees;
    }
};
