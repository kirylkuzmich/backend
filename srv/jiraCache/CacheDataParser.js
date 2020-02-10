module.exports = class CacheDataParser {

    static deleteDuplicatesAndEmptyEntries(aObject) {

        const oSetWODuplicates = new Set();
        aObject
        //flat array; method "flat" for array added only since Node JS 11.0
            .reduce((arr, val) => arr.concat(val), [])
            //Filter empty object
            .filter(value =>
                value &&
                (typeof value !== "object" || Object.values(value).length)
            )
            //Delete duplicates
            .forEach(value => {
                oSetWODuplicates.add(JSON.stringify(value));
            });

        return Array.from(oSetWODuplicates).map(value => JSON.parse(value));
    }
};
