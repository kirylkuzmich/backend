const DataBaseService = require(global.__base + "utils/DataBaseService");
const ViewCreator = require(global.__base + "utils/ViewCreator");
const DataCollector = require(global.__base + "utils/DataCollector");


module.exports = class DataService {
    constructor(sLogin, sPassword){
        this.oDataBaseService = new DataBaseService();
        this.oViewCreator = new ViewCreator(sLogin, sPassword);
    }

    async getProjects(){
        const oDbProjectsPromise = this.oDataBaseService.getProjects();
        const oJiraProjectsPromise = this.oViewCreator.getProjects();
        let aProjects = [];
        await Promise.all([oDbProjectsPromise, oJiraProjectsPromise])
            .then(aResults => {
                aProjects = DataCollector.getProjects(aResults[0], aResults[1]);
            })
            .catch(oError => console.dir(oError.message));
        return aProjects;
    };

};
