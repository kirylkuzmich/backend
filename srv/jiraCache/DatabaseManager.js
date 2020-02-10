const cds = require('@sap/cds');
const {INSERT, DELETE} = require('@sap/cds').ql;
const uuid = require('uuid/v4');
const DataSerializer = require(global.__base + "jiraCache/DataSerializer");
const oTableName = require(global.__base + "jiraCache/CacheConstant").oTableName;
const {
    oProjectAssignment: oProjectAssignmentFieldConst,
    oEmployee: oEmployeeFieldConst,
    oProject: oProjectFieldConst,
    oReportedHours: oReportedHoursFieldConst
} = require(global.__base + "jiraCache/CacheConstant").oFieldName;

module.exports = class DatabaseWorker {

    static async isCacheInitialized() {
        //todo add initialization logic
    }

    /**
     * Generate UUID for objects in array
     * @param {Array<T>} aObject
     * @return {Array<T>}
     */
    static generateUUID(aObject) {
        aObject.forEach(oObject => oObject.id = uuid());
        return aObject;
    }

    /**
     * Insert data into table
     * @param {string} sTableName - Table name
     * @param {Array<T>} aObjectData - Array of object for table
     * @return {Promise<Array<T>>}
     */
    static insertData(sTableName, aObjectData) {
        return cds.run(INSERT.into(sTableName).entries(aObjectData));
    }

    /**
     * Delete data from table by name of field
     * @param {string} sTableName
     * @param {string} sFieldName
     * @param {Array<T>} aObjectData
     * @return {Promise<boolean>}
     */
    static deleteDataByField(sTableName, sFieldName, aObjectData) {
        const aFinishAllDeleting = [];

        aObjectData.forEach(oObjectData => {
            const oWhereCondition = {};
            oWhereCondition[sFieldName] = oObjectData[sFieldName];
            aFinishAllDeleting.push(cds.run(DELETE.from(sTableName).where(oWhereCondition)));
        });

        return Promise.all(aFinishAllDeleting);
    }

    static updateEmployeeTable(aEmployee) {
        const aEmployeeWithId = DatabaseWorker.generateUUID(aEmployee);
        const aDatabaseFormatEmployee = DataSerializer.databaseEmployeesSerialize(aEmployeeWithId);
        DatabaseWorker.deleteDataByField(oTableName.EMPLOYEES, oEmployeeFieldConst.EXTERNAL_ID, aDatabaseFormatEmployee)
            .then(aInsertedHours => {/*todo add logging*/
            })
            .catch(error => {/*todo add logging*/
            })
            .finally(() => {
                DatabaseWorker.insertData(oTableName.EMPLOYEES, aDatabaseFormatEmployee)
                    .then(aInsertedEmployee => {/*todo add logging*/
                    })
                    .catch(error => {/*todo add logging*/
                    });
            });

        return aEmployeeWithId;
    }

    static updateProjectTable(aProject) {
        const aProjectWithId = DatabaseWorker.generateUUID(aProject);
        const aDatabaseFormatProject = DataSerializer.databaseProjectSerialize(aProjectWithId);
        DatabaseWorker.deleteDataByField(oTableName.PROJECTS, oProjectFieldConst.EXTERNAL_PROJECT_ID, aDatabaseFormatProject)
            .then(aInsertedHours => {/*todo add logging*/
            })
            .catch(error => {/*todo add logging*/
            })
            .finally(result => {
                DatabaseWorker.insertData(oTableName.PROJECTS, aDatabaseFormatProject)
                    .then(aInsertedProject => {/*todo add logging*/
                    })
                    .catch(error => {/*todo add logging*/
                    });
            });

        return aProjectWithId;
    }

    /**
     *
     * @param aProjectAssignment
     * @returns {*}
     */
    static updateAssignmentTable(aProjectAssignment) {
        const aProjectAssignmentWithId = DatabaseWorker.generateUUID(aProjectAssignment);
        const aDatabaseFormatProjectAssignment = DataSerializer.databaseProjectAssignmentSerialize(aProjectAssignmentWithId);
        DatabaseWorker.deleteDataByField(oTableName.PROJECT_ASSIGNMENTS, oProjectAssignmentFieldConst.EXTERNAL_ID, aDatabaseFormatProjectAssignment)
            .then(aInsertedHours => {/*todo add logging*/
            })
            .catch(error => {/*todo add logging*/
            })
            .finally(() => {
                DatabaseWorker.insertData(oTableName.PROJECT_ASSIGNMENTS, aDatabaseFormatProjectAssignment)
                    .then(aInsertedAssignment => {/*todo add logging*/
                    })
                    .catch(error => {/*todo add logging*/
                    });
            });

        return aProjectAssignmentWithId;
    }

    /**
     *
     * @param aProjectHoursData
     * @returns {*}
     */
    static updateProjectHoursTable(aProjectHoursData) {
        const aProjectHoursDataWithId = DatabaseWorker.generateUUID(aProjectHoursData);
        const aDatabaseFormatProjectHours = DataSerializer.databaseProjectHoursSerialize(aProjectHoursDataWithId);
        DatabaseWorker.deleteDataByField(oTableName.PROJECT_ASSIGNMENTS, oReportedHoursFieldConst.DATE, aDatabaseFormatProjectHours)
            .then(aInsertedHours => {/*todo add logging*/
            })
            .catch(error => {/*todo add logging*/
            })
            .finally(() => {
                DatabaseWorker.insertData(oTableName.PROJECT_HOURS, aDatabaseFormatProjectHours)
                    .then(aInsertedHours => {/*todo add logging*/
                    })
                    .catch(error => {/*todo add logging*/
                    });
            });

        return aProjectHoursDataWithId;
    }


};
