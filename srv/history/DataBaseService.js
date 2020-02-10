const HanaService = require(global.__base + "utils/HanaService");
const HanaFiller = require(global.__base + "utils/HanaFiller");

module.exports = class DataBaseService{
    constructor(){
        this.oHanaService = new HanaService();
        this.oHanaFiller = new HanaFiller();
    }

    async getEmployees(){
        return (await this.oHanaService.getEmployees()).map(oEmployee => {
            return {
                ID: oEmployee.ID,
                externalID: oEmployee.EXTERNALID
            };
        });
    }

    /**
     * Get array of projects in CamelCase
     * @returns {Promise<{externalID: *, ID: *, validFrom: *, validTo: *}[]>}
     */
    async getProjects(){
        return (await this.oHanaService.getProjects()).map(oProject => {
            return {
                ID: oProject.ID,
                externalID: oProject.EXTERNALID,
                validFrom: oProject.VALIDFROM,
                validTo: oProject.VALIDTO
            };
        });
    }

    async getPositions(){
        return (await this.oHanaService.getPositions()).map(oPosition => {
            return {
                ID: oPosition.ID,
                rank: oPosition.RANK
            };
        });
    }

    async getProjectAssignments(){
        return (await this.oHanaService.getProjectAssignments()).map(oProjectAssignment => {
            return {
                ID: oProjectAssignment.ID,
                involvePercent: oProjectAssignment.INVOLVEPERCENT,
                employeeID: oProjectAssignment.EMPLOYEEID,
                projectID: oProjectAssignment.PROJECTID,
                positionID: oProjectAssignment.POSITIONID,
                validFrom: oProjectAssignment.VALIDFROM,
                validTo: oProjectAssignment.VALIDTO
            };
        });
    }

    async getCacheProjectAssignments(){
        return (await this.oHanaService.getCacheProjectAssignments()).map(oProjectAssignment => {
            return {
                ID: oProjectAssignment.ID,
                employeeID: oProjectAssignment.EMPLOYEEID,
                projectID: oProjectAssignment.PROJECTID
            };
        });
    }

    async getCacheReportedHours(){
        return (await this.oHanaService.getCacheReportedHours()).map(oReportedHour => {
            return {
                ID: oReportedHour.ID,
                date: oReportedHour.date,
                hours: oReportedHour.hours,
                projectAssignments_ID: oReportedHour.PROJECTASSIGNMENTS_ID
            };
        });
    }

    async createCacheProjectAssignments(oData){
        this.oHanaFiller.insertCacheProjectAssignments(Array.isArray(oData) ? oData : [oData]);
    }

    async createCacheReportedHours(oData){
        this.oHanaFiller.insertCacheReportedHours(Array.isArray(oData) ? oData : [oData]);
    }

    async dropReportedHoursRows(){
        return this.oHanaFiller.dropCacheReportedHoursRows();
    }
};
