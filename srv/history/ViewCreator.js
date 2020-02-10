const JiraDataService = require('./JiraDataService');
const JiraDataSelector = require('./JiraDataSelector');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = class ViewCreator{
    constructor (sLogin, sPassword){
        this.oDataService = new JiraDataService(sLogin, sPassword);
        this.oDataSelector = new JiraDataSelector();
    }

    async getProjects(){
        return (await this.oDataService.getProjects())
            .map(oProject => this.oDataSelector.getProjectEntity(oProject));
    }

    async getCacheEmployees(){
        return (await this.oDataService.getEmployees())
            .map(oUser => this.oDataSelector.getCacheEmployeeEntityFromJiraUser(oUser));
    }

    async getCacheProjectAssignments(){
        const aProjects = await this.getProjects();
        let aProjectAssignments = [];

        await asyncForEach(aProjects, async oProject => {
            const oRoles = await this.oDataService.getProjectRoles(oProject.externalID);
            const aProjectUris = this.oDataSelector.getRolesUris(oRoles);
            const aProjectActors = await this.oDataService.getProjectMembersByRoles(aProjectUris);
            const aProjectEmployees = this.oDataSelector.getUniqFromRolesActors(aProjectActors)
                .map(oActor => this.oDataSelector.getCacheUserEntityFromActor(oActor, oProject.externalID));
            aProjectAssignments = aProjectAssignments.concat(aProjectEmployees);
        });

        return aProjectAssignments;
    }

    async getCacheReportedHours(){
        const aProjects = await this.getProjects();
        let aReportedHours = [];
        await asyncForEach(aProjects, async oProject => {
            const aProjectIssuesWorkLogs = await this.oDataService.getProjectWorkLogs(oProject.externalID);
            aReportedHours = aProjectIssuesWorkLogs.reduce((aTotal, oCur) => aTotal
                .concat(this.oDataSelector.getCacheReportedHoursEntitiesFromIssueWorkLog(oCur, oProject.externalID)), aReportedHours);
        });
        return aReportedHours;
    }
};
