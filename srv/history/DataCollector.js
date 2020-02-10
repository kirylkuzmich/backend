module.exports = class DataCollector {
    static getProjects(aDBProjects, aJiraProjects) {
        const oDBProjectsMap = aDBProjects.reduce((oTotal, oCur) => {
            oTotal[oCur.externalID] = oCur;
            return oTotal;
        }, {});
        return aJiraProjects.map(oJiraProject => {
            return oDBProjectsMap[oJiraProject.externalID] ? {
                ID: oDBProjectsMap[oJiraProject.externalID].ID,
                externalID: oJiraProject.externalID,
                projectType: oJiraProject.projectType,
                name: oJiraProject.name,
                departmentID: oJiraProject.departmentID,
                validFrom: oDBProjectsMap[oJiraProject.externalID].validFrom,
                validTo: oDBProjectsMap[oJiraProject.externalID].validTo
            } : {
                ID: "-1",
                externalID: oJiraProject.externalID,
                projectType: oJiraProject.projectType,
                name: oJiraProject.name,
                departmentID: oJiraProject.departmentID,
                validFrom: "2019-01-01 00:00:00",
                validTo: `${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()} 00:00:00`
            };
        });
    }
};
