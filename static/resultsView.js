// State

let resultsState = {
    results: null
}

// Service

const fetchServiceResults = function(service) {
    return fetch('http://localhost:8080/tests/' + service)
    .then(response => response.json())
    .then(data => {
        resultsState.results = data;
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

// Helplers

const isPassed = function(testResult) {
    return testResult.Failed === 0 && testResult.Errored === 0;
}

const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

const totalPassed = function(results) {
    return results.filter(isPassed).length;
}

const totalFailed = function(results) {
    return results.filter((x) => !isPassed(x)).length;
}

const passRate = function(results) {
    return ~~((results.filter(isPassed).length / results.length)*100);
}

// Components

const ResultEntry = {
    view: function(vnode) {
        let testResult = null;
        if(isPassed(vnode.attrs)) {
            testResult = m("div", {class: "result resultPassed"}, "☑");
        } else {
            testResult = m("div", {class: "result resultFailed"}, "☒");
        }

        return m("div", {class: "resultEntry"},
            testResult);
    }
}

const ResultDayColumn = {
    view: function(vnode) {
        const args = ["div", {class: "resultDayColumn"}, m("div", {class: "resultDayColumnDate"}, vnode.attrs.date)]
            .concat(vnode.attrs.entries.map(x => m(ResultEntry, x)));
        return m.apply(this, args);
    }
}

const ResultMetrics = {
    view: function(vnode) {
        const results = vnode.attrs.results;
        return m("div", {class: "resultMetrics"},
            m("p", "Builds: " + results.length),
            m("p", "Passed: " + totalPassed(results)),
            m("p", "Failed: " + totalFailed(results)),
            m("p", "Passrate: " + passRate(results) + "%"));
    }
}

const ResultEntries = {
    oninit: function(vnode) {
        fetchServiceResults(vnode.attrs.name)
        .then(_ => m.redraw());
    },
    view: function(vnode) {
        if(resultsState.results === null) {
            return m("div", {class: "resultEntries"}, "Searching")
        } else {
            const date = new Date();

            resultsState.results.forEach((x) => {
                const batchedDate = new Date(x.CreatedAt);
                batchedDate.setMilliseconds(~~(batchedDate.getMilliseconds()/100))
                x.CreatedAtBatched = `${batchedDate.getHours()}${batchedDate.getSeconds()}${batchedDate.getMilliseconds()}`;
            });
            const dayGroups = groupBy(resultsState.results, "CreatedAtBatched");

            const args = ["div", {class: "resultEntries"}, m(ResultMetrics, {results: resultsState.results})]
                .concat(Object.keys(dayGroups).map(x => m(ResultDayColumn, {date: x, entries: dayGroups[x]})));
            return m.apply(this, args);
        }
    }
}

const ResultsView = {
    view: function(vnode) {
        const serviceName = m.route.param("name");

        return m("div", {class: "resultsView"},
            m("p", "Service - " + serviceName),
            m(ResultEntries, {name: serviceName}));
    }
}