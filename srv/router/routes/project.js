/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");
const dbClass = require(global.__base + "utils/dbClass");

module.exports = () => {
    const app = express.Router();
    app.post("/", async (req, res, next) => {
        const aPromises = [];
        const db = new dbClass(req.db);
        const oProject = req.body;
        const aProjectAssignment = oProject.projectAssignment;
        const sSqlInsertProject = `INSERT INTO PLANNINGENTITIES_PROJECTS VALUES(?,?,?,?,?,?,?,?,?,?)`;
        const sSqlInsertProjectAssignment = `INSERT INTO PLANNINGENTITIES_PROJECTASSIGNMENTS VALUES(?,?,?,?,?,?,?,?,?)`;
        const aValues = [oProject.ID, oProject.startAt, oProject.finishAt, oProject.description,
            oProject.ID, oProject.name, oProject.projectType, oProject.departmentID, oProject.jiraLink, oProject.probability];
        aPromises.push(db.executeUpdate(sSqlInsertProject, aValues));

        for(const oProjectAssignment of aProjectAssignment){
            const aValuesProjectAssignment = [oProjectAssignment.ID, oProjectAssignment.projectID, oProjectAssignment.employeeID, oProjectAssignment.startAt,
                oProjectAssignment.finishAt, oProjectAssignment.involvePercent, oProjectAssignment.projectID, oProjectAssignment.employeeID, oProjectAssignment.position_ID];
            aPromises.push(db.executeUpdate(sSqlInsertProjectAssignment, aValuesProjectAssignment));
        }

        Promise.all(aPromises)
            .then (() => res.type("application/json").status(201).send(JSON.stringify(oProject)))
            .catch(err => {
                next(err);
            });
    });

    app.put("/:id", async (req, res, next) => {
        const aPromises = [];
        const db = new dbClass(req.db);
        const oProject = req.body;
        const id = req.params.id;
        const aProjectAssignmentModified = oProject.projectAssignmentModified;
        const aProjectAssignmentRemoved = oProject.projectAssignmentRemoved;
        const aProjectAssignmentAdded = oProject.projectAssignmentAdded;
        const sSqlUpdateProject = `UPDATE PLANNINGENTITIES_PROJECTS SET startAt = ?, finishAt = ?, description = ?, name = ?, projectType = ? WHERE ID = ?`;
        const sSqlInsertProjectAssignment = `INSERT INTO PLANNINGENTITIES_PROJECTASSIGNMENTS VALUES(?,?,?,?,?,?,?,?,?)`;
        const sSqlUpdateProjectAssignment = `UPDATE PLANNINGENTITIES_PROJECTASSIGNMENTS SET startAt = ?, finishAt = ?, involvePercent = ?, position_ID = ? WHERE ID = ?`;
        const sSqlDeleteProjectAssignment = `DELETE FROM PLANNINGENTITIES_PROJECTASSIGNMENTS WHERE ID = ?`;
        const aValues = [oProject.startAt, oProject.finishAt, oProject.description, oProject.name, oProject.projectType, id];
        aPromises.push(db.executeUpdate(sSqlUpdateProject, aValues));

        for(const oProjectAssignment of aProjectAssignmentModified){
            const aValuesProjectAssignment = [oProjectAssignment.startAt, oProjectAssignment.finishAt, oProjectAssignment.involvePercent,
                oProjectAssignment.position_ID, oProjectAssignment.ID];
            aPromises.push(db.executeUpdate(sSqlUpdateProjectAssignment, aValuesProjectAssignment));
        }

        for(const oProjectAssignment of aProjectAssignmentAdded){
            const aValuesProjectAssignment = [oProjectAssignment.ID, oProjectAssignment.projectID, oProjectAssignment.employeeID, oProjectAssignment.startAt,
                oProjectAssignment.finishAt, oProjectAssignment.involvePercent, oProjectAssignment.projectID, oProjectAssignment.employeeID, oProjectAssignment.position_ID];
            aPromises.push(db.executeUpdate(sSqlInsertProjectAssignment, aValuesProjectAssignment));
        }

        for(const oProjectAssignment of aProjectAssignmentRemoved){
            const aValuesProjectAssignment = [oProjectAssignment.ID];
            aPromises.push(db.executeUpdate(sSqlDeleteProjectAssignment, aValuesProjectAssignment));
        }

        Promise.all(aPromises)
            .then (() => res.type("application/json").status(201).send(JSON.stringify(oProject)))
            .catch(err => {
                next(err);
            });
    });

    return app;
};
