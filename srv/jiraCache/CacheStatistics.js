const {performance, PerformanceObserver} = require("perf_hooks");

module.exports = class CacheStatistics {

    static startTrackMeasurePerformance() {
        CacheStatistics.oPerfObserver = new PerformanceObserver((list, observer) => {
            list.getEntries().forEach(value => {
                // console.log(value);
            });
            performance.clearMarks();
            observer.disconnect();
        });
        CacheStatistics.oPerfObserver.observe({entryTypes: ["measure"], buffered: true});
    }

    static endTrackMeasurePerformance() {
        CacheStatistics.oPerfObserver.disconnect();
    }
};
