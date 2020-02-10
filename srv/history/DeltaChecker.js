const DataBaseService = require(global.__base + "utils/DataBaseService");
const ViewCreator = require(global.__base + "utils/ViewCreator");
const CronJob = require('cron').CronJob;

module.exports = class DeltaChecker{
    constructor(sLogin, sPassword){
        this.oViewCreator = new ViewCreator(sLogin, sPassword);
        this.oDataBaseService = new DataBaseService();

        //Declaration of jobs with 1 minute cycle
        const projectAssignmentsRefresher = new CronJob('0 */1 * * * *', ()=>{this.refreshCachedProjectAssignments();});
        const reportedHoursRefresher = new CronJob('0 */1 * * * *', ()=>{this.refreshCachedReportedHours();});

        //start of jobs
        projectAssignmentsRefresher.start();
        reportedHoursRefresher.start();
    }

    async refreshCachedProjectAssignments(){
        let aDBProjectAssignments = [];
        let aJiraProjectAssignments = [];

        //load data from DB and Jira API
        await Promise.all([this.oDataBaseService.getCacheProjectAssignments(), this.oViewCreator.getCacheProjectAssignments()])
            .then(aResults => {
                aDBProjectAssignments = aResults[0] ? aResults[0] : [];
                aJiraProjectAssignments = aResults[1] ? aResults[1] : [];
            }).catch();

        //make for check is the entity in database
        const aDBProjectAssignmentsMAP = aDBProjectAssignments.reduce((oTotal, oCur) => {
            oTotal[oCur.employeeID.concat(oCur.projectID)] = oCur;
            return oTotal;
        },{});

        //create array of not collected rows
        const aProjectAssignmentsToInsert = aJiraProjectAssignments.reduce((aTotal, oCur) => {
            return aDBProjectAssignmentsMAP[oCur.employeeID.concat(oCur.projectID)]
                ? aTotal
                : (() => {
                    aTotal.push({
                        ID : `${aDBProjectAssignments.length + aTotal.length}`,
                        projectID: oCur.projectID,
                        employeeID: oCur.employeeID
                    });
                    return aTotal;
                })();
        }, []);

        if (aProjectAssignmentsToInsert.length > 0){
            //create not collected rows in database
            await this.oDataBaseService.createCacheProjectAssignments(aProjectAssignmentsToInsert);
        }

        console.dir(`INFO: Cache project assignments to create: ${aProjectAssignmentsToInsert.length} rows, collected: ${aJiraProjectAssignments.length}`);
    }

    async refreshCachedReportedHours(){
        let aDBProjectAssignments = [];
        let aJiraReportedHours = [];

        await Promise.all([
            this.oDataBaseService.dropReportedHoursRows(),
            this.oDataBaseService.getCacheProjectAssignments(),
            this.oViewCreator.getCacheReportedHours()
        ]).then(aResults => {
            console.dir(aResults.length);
            aDBProjectAssignments = aResults[1] ? aResults[1] : [];
            aJiraReportedHours = aResults[2] ? aResults[2] : [];
        }).catch(oError => console.dir(`ERROR: clearAndFillCacheReportedHours ${oError}`));
        // make object map to fill projectAssignments_ID field
        const aDBProjectAssignmentsMap = aDBProjectAssignments.reduce((oTotal, oCur) => {
            oTotal[oCur.employeeID.concat(oCur.projectID)] = oCur;
            return oTotal;
        },{});

        const aReportedHoursToInsert = aJiraReportedHours.reduce((aTotal, oCur, iIndex) => {
            return aDBProjectAssignmentsMap[oCur.employeeID.concat(oCur.projectID)]
                ? aTotal.concat([{
                    ID: `${aTotal.length}`,
                    date: oCur.date.substr(0, 10),
                    hours: oCur.hours,
                    projectAssignments_ID: aDBProjectAssignmentsMap[oCur.employeeID.concat(oCur.projectID)].ID
                }])
                : aTotal;
        },[]);
        if (aReportedHoursToInsert.length > 0){
            await this.oDataBaseService.createCacheReportedHours(aReportedHoursToInsert);
        }

        console.dir(`INFO: Cache reported hours to create : ${aReportedHoursToInsert.length} rows, not collected : ${aJiraReportedHours.length - aReportedHoursToInsert.length}`);
    }

};

