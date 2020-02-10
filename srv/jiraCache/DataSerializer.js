const {
    oProjectAssignment: oProjectAssignmentFieldConst,
    oEmployee: oEmployeeFieldConst,
    oProject: oProjectFieldConst,
    oReportedHours: oReportedHoursFieldConst
} = require(global.__base + "jiraCache/CacheConstant").oFieldName;

module.exports = class DataSerializer {
    /**
     * @typedef CacheEmployee {Object}
     * @property {string} externalId
     * @property {string} name
     * @property {string} emailAddress
     */
    /**
     * @typedef CacheEmployeeID {Object}
     * @property {string} externalId
     */
    /**
     * @typedef CacheIssueID {Object}
     * @property {string} externalId
     */
    /**
     * @typedef CacheProjectAssignment {Object}
     * @property {string} projectId
     * @property {string} employeeId
     */

    /**
     * @typedef CacheProject {Object}
     * @property {string} externalId
     * @property {string} name
     * @property {string} projectType
     * @property {string} departmentId - lead Id, Why? I don't know
     */

    /**
     *
     * @param {User} oUser
     * @return {CacheEmployee}
     */
    static userSerialize(oUser) {
        return {
            externalId: oUser.accountId,
            accountType: oUser.accountType,
            name: oUser.displayName,
            emailAddress: oUser.emailAddress || "example@example.example"
        };
    }

    /**
     *
     * @param {User} oUser
     * @return {CacheEmployeeID}
     */
    static userIDSerialize(oUser) {
        return {
            externalId: oUser.accountId,
        };
    }

    /**
     *
     * @param oWorkLog
     * @returns {{date: *, hours: number, employeeId: *}}
     */
    static worklogsSerialize(oWorkLog) {
        return {
            date: oWorkLog.startDate,
            hours: oWorkLog.timeSpentSeconds / 60 / 60,
            employeeId: oWorkLog.author.accountId,
        };
    }

    /**
     *
     * @param aWorkLogSerialize
     * @param oProject
     * @returns {*}
     */
    static mappingInternalProjectIdToWorkLog(aWorkLogSerialize, oProject) {
        aWorkLogSerialize.forEach(oWorkLog => {
                oWorkLog.internalProjectId = oProject.id;
            }
        );
        return aWorkLogSerialize;
    }

    /**
     *
     * @param aWorkLogSerialize
     * @param aSerializedUser
     * @returns {*}
     */
    static mappingInternalUserIdToWorkLogs(aWorkLogSerialize, aSerializedUser) {
        const oUserMapExternalIdInternalId = new Map(aSerializedUser.map(oSerializedUser =>
            [oSerializedUser.externalId, oSerializedUser.id]
        ));

        aWorkLogSerialize.forEach(oWorkLog => {
            oWorkLog.internalUserId = oUserMapExternalIdInternalId.get(oWorkLog.employeeId);
        });

        return aWorkLogSerialize;
    }

    /**
     *
     * @param aProjectHoursSerialize
     * @param aProjectAssignments
     * @returns {*}
     */
    static addProjectAssignmentsToReportedHoursSerialize(aProjectHoursSerialize, aProjectAssignments) {
        const oMapEmployeeProjectAssignmentId = new Map(aProjectAssignments.map(oProjectAssignment =>
            [oProjectAssignment.employeeId, oProjectAssignment.id]
        ));

        aProjectHoursSerialize.forEach(oProjectHoursSerialize => {
            oProjectHoursSerialize.projectAssignmentsId = oMapEmployeeProjectAssignmentId.get(oProjectHoursSerialize.employeeId);
        });

        return aProjectHoursSerialize;
    }


    /**
     *
     * @param {Project} oProject
     * @return {CacheProject}
     */
    static projectSerialize(oProject) {
        return {
            externalId: oProject.key,
            name: oProject.name,
            description: oProject.projectCategory || "",
            projectType: oProject.projectTypeKey,
            departmentId: oProject.lead.accountId
        };
    }

    /**
     *
     * @param oProjectSerialized
     * @param oUser
     * @returns {CacheProjectAssignment}
     */
    static projectAssigmentSerialize(oProjectSerialized, oUser) {
        return {
            projectId: oProjectSerialized.externalId,
            employeeId: oUser.externalId
        };
    }

    static databaseEmployeesSerialize(aEmployee) {
        return aEmployee.map(oEmployee => {
            const oDbNewObject = {};
            oDbNewObject[oEmployeeFieldConst.ID] = oEmployee.id;
            oDbNewObject[oEmployeeFieldConst.EXTERNAL_ID] = oEmployee.externalId;
            oDbNewObject[oEmployeeFieldConst.EMAIL_ADDRESS] = oEmployee.emailAddress;
            oDbNewObject[oEmployeeFieldConst.NAME] = oEmployee.name;
            return oDbNewObject;
        });
    }

    static databaseProjectSerialize(aProject) {
        return aProject.map(oProject => {
            const oDbNewObject = {};
            oDbNewObject[oProjectFieldConst.ID] = oProject.id;
            oDbNewObject[oProjectFieldConst.EXTERNAL_PROJECT_ID] = oProject.externalId;
            oDbNewObject[oProjectFieldConst.PROJECT_TYPE] = oProject.projectType;
            oDbNewObject[oProjectFieldConst.NAME] = oProject.name;
            oDbNewObject[oProjectFieldConst.DEPARTMENT_ID] = oProject.departmentId;
            oDbNewObject[oProjectFieldConst.DESCRIPTION] = oProject.description.toString();
            return oDbNewObject;
        });
    }

    static databaseProjectAssignmentSerialize(aProjectAssignment) {
        return aProjectAssignment.map(oProjectAssignment => {
            const oDbNewObject = {};
            oDbNewObject[oProjectAssignmentFieldConst.ID] = oProjectAssignment.id;
            oDbNewObject[oProjectAssignmentFieldConst.EXTERNAL_PROJECT_ID] = oProjectAssignment.projectId;
            oDbNewObject[oProjectAssignmentFieldConst.EXTERNAL_EMPLOYEE_ID] = oProjectAssignment.employeeId;
            oDbNewObject[oProjectAssignmentFieldConst.INTERNAL_PROJECT_ID] = oProjectAssignment.internalProjectId;
            oDbNewObject[oProjectAssignmentFieldConst.INTERNAL_EMPLOYEE_ID] = oProjectAssignment.internalUserId;
            return oDbNewObject;
        });
    }

    static databaseProjectHoursSerialize(aProjectHours) {
        return aProjectHours.map(oProjectHours => {
            const oDbNewObject = {};
            oDbNewObject[oReportedHoursFieldConst.ID] = oProjectHours.id;
            oDbNewObject[oReportedHoursFieldConst.DATE] = oProjectHours.date;
            oDbNewObject[oReportedHoursFieldConst.HOURS] = oProjectHours.hours;
            oDbNewObject[oReportedHoursFieldConst.PROJECT_ASSIGNMENT_ID] = oProjectHours.projectAssignmentsId;
            return oDbNewObject;
        });
    }
};
