module.exports = {
    oTableName: {
        EMPLOYEES: 'PLANNINGENTITIES_EMPLOYEES',
        PROJECTS: 'PLANNINGENTITIES_PROJECTS',
        PROJECT_ASSIGNMENTS: 'PLANNINGENTITIES_PROJECTASSIGNMENTS',
        PROJECT_HOURS: 'PLANNINGENTITIES_REPORTEDHOURS',
    },
    oFieldName: {
        oProjectAssignment: {
            ID: "ID",
            INTERNAL_PROJECT_ID: "PROJECT_ID",
            EXTERNAL_PROJECT_ID: "PROJECTID",
            INTERNAL_EMPLOYEE_ID: "EMPLOYEE_ID",
            EXTERNAL_EMPLOYEE_ID: "EMPLOYEEID"
        },
        oProject: {
            ID: "ID",
            EXTERNAL_PROJECT_ID: "EXTERNALID",
            NAME: "NAME",
            PROJECT_TYPE: "PROJECTTYPE",
            DEPARTMENT_ID: "DEPARTMENTID",
            DESCRIPTION: "DESCRIPTION"
        },
        oEmployee: {
            ID:"ID",
            EXTERNAL_ID: "EXTERNALID",
            NAME: "NAME",
            EMAIL_ADDRESS: "EMAILADDRESS"
        },
        oReportedHours: {
            ID: "ID",
            DATE: "DATE",
            HOURS: "HOURS",
            PROJECT_ASSIGNMENT_ID: "PROJECTASSIGNMENTS_ID"
        }
    },
    oObjectIgnoreFilter: {
        //Using set for future easy expand
        oProject: {
            TYPE: new Set(["service_desk"]),
            NAME: new Set(["ANONWORK01"])
        },
        oUser: {
            TYPE: new Set(["customer"])
        }
    }
};
