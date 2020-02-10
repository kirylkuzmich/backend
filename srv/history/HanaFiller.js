const cdsQl = require('@sap/cds-ql');
const cds = require('@sap/cds');

module.exports = class HanaFiller {

    async makeInsert(sTable, aEntries){
        try {
            INSERT.into(sTable)
                .entries(aEntries);
        } catch (oError){
            console.dir(`ERROR: ${oError.message}`);
        }
    }

    async makeDelete(sTable, oExpr){
        cds
            .foreach(DELETE(sTable).where(oExpr))
            .catch();
    }

    async insertProjectAssignments(aEntries) {
        this.makeInsert('PLANNING_PROJECTASSIGNMNETS', aEntries);
    }

    async insertEmployees(aEntries) {
        this.makeInsert('PLANNING_EMPLOYEES', aEntries);
    }

    async insertProjects(aEntries) {
        this.makeInsert('PLANNING_PROJECTS', aEntries);
    }

    async insertPositions(aEntries) {
        this.makeInsert('PLANNING_POSITIONS', aEntries);
    }

    async insertCacheProjectAssignments(aEntries) {
        this.makeInsert('JIRACACHE_PROJECTASSIGNMENTS', aEntries);
    }

    async insertCacheReportedHours(aEntries) {
        this.makeInsert('JIRACACHE_REPORTEDHOURS', aEntries);
    }

    async dropCacheReportedHoursRows(){
        await cds.foreach(DELETE.from('JIRACACHE_REPORTEDHOURS').where ({ID:{'>':'-1'}}));
        return true;
    }
};
