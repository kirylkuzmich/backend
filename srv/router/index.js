/*eslint-env node, es6 */
"use strict";
const fs = require("fs");

module.exports = (app, server) => {
    app.use("/Projects", require("./routes/project")());
    app.use("/Employees", require("./routes/employee")());
    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");

        logger.info("info");
        logger.error("error");
        logger.fatal("fatal");
        next();
    });

};
