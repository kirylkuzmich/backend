module.exports = class JiraDataSelector {

    getRolesUris(oRoles){
        return Object.keys(oRoles).map(sKey => oRoles[sKey]);
    }

    getUniqFromRolesActors(aActors){
        let aUniqActors = [];
        const oAddedMembersMap = {};

        aUniqActors = aUniqActors.concat(aActors.filter(oActor => {
            if (oActor.type === "atlassian-user-role-actor" && !oAddedMembersMap[oActor.name] && oActor.name.search('_') === -1) {
                oAddedMembersMap[oActor.name] = true;
                return true;
            }
            return false;
        }));

        return aUniqActors;
    }

    getProjectEntity(oProject){
        return {
            externalID: oProject.id,
            projectType: oProject.projectCategory.name,
            departmentID: oProject.lead.accountId,
            name: oProject.name
        };
    }

    getCacheUserEntityFromActor(oUser, projectID){
        return {
            employeeID: oUser.actorUser.accountId,
            projectID: projectID
        };
    }

    getCacheEmployeeEntityFromJiraUser(oUser){
        return {
            employeeID: oUser.accountId,
            name: oUser.displayName,
            emailAddress: oUser.emailAddress
        };
    }

    getCacheReportedHoursEntitiesFromIssueWorkLog(oIssueWorkLog, sProjectId){
        const sEmployeeID = this._getEmployeeIDFromIssueWorklog(oIssueWorkLog);
        let aWorkLogs = [];
        if (oIssueWorkLog.fields.worklog && oIssueWorkLog.fields.worklog.worklogs){
                aWorkLogs = oIssueWorkLog.fields.worklog.worklogs.map(oWorkLog => {
                    return {
                        date: oWorkLog.started,
                        hours: oWorkLog.timeSpentSeconds / 3600,
                        employeeID: sEmployeeID,
                        projectID: sProjectId
                    };
                });
        }
        return aWorkLogs;
    }

    _getEmployeeIDFromIssueWorklog(oIssueWorkLog){
        let sEmployeeID = "NOT founded field: assignee";
        if (oIssueWorkLog.fields.assignee){
            sEmployeeID = oIssueWorkLog.fields.assignee.accountId ?
                oIssueWorkLog.fields.assignee.accountId : "NOT founded field: accountId";
        }
        return sEmployeeID;
    }
};
