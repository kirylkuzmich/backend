const cdsQl = require('@sap/cds-ql');
const cds = require('@sap/cds');

module.exports = class HanaService{
    async doSelect(sTableName){
        const aData = [];

        const elems = SELECT.from(sTableName);
        cds.foreach(elems, oData => aData.push(oData))
                 .catch(oError => console.dir(`ERROR: ${oError.message}`));

        return aData;
    }

    async getProjectAssignments(){
        return this.doSelect('PLANNING_PROJECTASSIGNMNETS');
    }

    async getEmployees(){
        return this.doSelect('PLANNING_EMPLOYEES');
    }

    async getProjects(){
        return this.doSelect('PLANNING_PROJECTS');
    }

    async getPositions(){
        return this.doSelect('PLANNING_POSITIONS');
    }

    async getCacheProjectAssignments(){
        return this.doSelect('JIRACACHE_PROJECTASSIGNMENTS');
    }

    async getCacheReportedHours(){
        return this.doSelect('JIRACACHE_REPORTEDHOURS');
    }
};
