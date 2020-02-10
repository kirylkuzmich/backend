/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");
const dbClass = require(global.__base + "utils/dbClass");

module.exports = () => {
    const app = express.Router();
    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oEmployee = req.body;
            const sSql = `INSERT INTO PLANNINGENTITIES_EMPLOYEES VALUES(?,?,?,?,?,?,?,?,?)`;
            const aValues = [oEmployee.ID, oEmployee.ID, oEmployee.name, oEmployee.emailAddress, oEmployee.phone, oEmployee.jiraLink, oEmployee.dateEnd,
                oEmployee.imageUri, oEmployee.position_ID];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oEmployee));
        } catch (e) {
            next(e);
        }
    });

    app.put("/:id", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oEmployee = req.body;
            const id = req.params.id;
            const sSql = `UPDATE PLANNINGENTITIES_EMPLOYEES SET name = ?, dateEnd = ?, emailAddress = ?, phone = ?, jiraLink = ?, position_ID = ? WHERE ID = ?`;
            const aValues = [oEmployee.name, oEmployee.dateEnd,
                oEmployee.emailAddress, oEmployee.phone, oEmployee.jiraLink, oEmployee.position_ID, id];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oEmployee));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
