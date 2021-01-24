import Breadcrumb from '../components/breadcrumb.js';

// Helplers

const isPassed = function (testResult) {
    return testResult.Failed === 0 && testResult.Errored === 0;
}

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

const totalPassed = function (results) {
    return results.filter(isPassed).length;
}

const totalFailed = function (results) {
    return results.filter((x) => !isPassed(x)).length;
}

const passRate = function (results) {
    return ~~((results.filter(isPassed).length / results.length) * 100);
}

// Components

const ResultEntry = {
    view: function (vnode) {
        let testResult = null;
        if (isPassed(vnode.attrs)) {
            testResult = m("div", { class: "result resultPassed" }, "☑");
        } else {
            testResult = m("div", { class: "result resultFailed" }, "☒");
        }

        return m("div", { class: "resultEntry" },
            testResult);
    }
}

const ResultDayColumn = {
    view: function (vnode) {
        const args = ["div", { class: "resultDayColumn" }, m("div", { class: "resultDayColumnDate" }, vnode.attrs.date)]
            .concat(vnode.attrs.entries.map(x => m(ResultEntry, x)));
        return m.apply(this, args);
    }
}

const ResultMetrics = {
    view: function (vnode) {
        const results = vnode.attrs.results;
        return m("div", { class: "resultMetrics" },
            m("p", "Builds: " + results.length),
            m("p", "Passed: " + totalPassed(results)),
            m("p", "Failed: " + totalFailed(results)),
            m("p", "Passrate: " + passRate(results) + "%"));
    }
}

const ResultEntries = function () {
    let results = null;
 
    const fetchServiceResults = function (service) {
        return fetch('http://localhost:8080/tests/' + service)
            .then(response => response.json())
            .then(data => {
                results = data;
            }).catch(function (err) {
                console.warn('Something went wrong.', err);
            });
    }

    return {
        oninit: function(vnode) {
            fetchServiceResults(vnode.attrs.name)
                .then(_ => m.redraw());
        },
        view: function(vnode) {
            if (results === null) {
                return m("div", { class: "resultEntries" }, "Searching")
            } else {
                const date = new Date();

                results.forEach((x) => {
                    const batchedDate = new Date(x.CreatedAt);
                    // The view currently displays columns per millisecond as there's no way to simulate uploading
                    // test results aver multiple days, clamp to the nearest 100ms to generate better looking fake data
                    batchedDate.setMilliseconds(~~(batchedDate.getMilliseconds() / 10))
                    x.CreatedAtBatched = `${batchedDate.getHours()}${batchedDate.getSeconds()}${batchedDate.getMilliseconds()}`;
                });
                const dayGroups = groupBy(results, "CreatedAtBatched");

                const args = ["div", { class: "resultEntries" }, m(ResultMetrics, { results: results })]
                    .concat(Object.keys(dayGroups).map(x => m(ResultDayColumn, { date: x, entries: dayGroups[x] })));
                return m.apply(this, args);
            }
        },
        onbeforeremove: function(vnode) {
            rersults = null;
        }
    }
}

const FlakeEntry = {
    view: function(vnode) {
        return m("div", {class: "flakeEntry"},
            m("p", vnode.attrs.name + " | " + vnode.attrs.passRate + "%"));
    }
}

const FlakeEntries = function() {
    let passFailRates = null;

    const fetchServiceExecutions = function (service) {
        return fetch('http://localhost:8080/executions/' + service)
            .then(response => response.json())
            .catch(function (err) {
                console.warn('Something went wrong.', err);
            });
    }

    const analyseFlakeyTests = function(testExecutions) {
        let uniqueCases = testExecutions.map((te) => te.Classname + ":" + te.Name)
            .filter((value, index, self) => self.indexOf(value) === index);
        
        let flakyPassFailRates = uniqueCases.map((te) => {
            const testCaseExecutions = testExecutions.filter((x) => (x.Classname + ":" + x.Name) === te);
            const passed = testCaseExecutions.filter((x) => x.Status === "passed").length;
            const failed = testCaseExecutions.filter((x) => x.Status === "failed" || x.Status === "errored").length;
            return {
                "passed": passed,
                "failed": failed,
                passRate: ~~(100.0 * (passed / (passed + failed))),
                name: te
            }
        }).filter(pfr => pfr.passRate !== 100.0)
        .sort(((a, b) => a.passRate - b.passRate));
        
        return flakyPassFailRates;
    }

    return {
        oninit: function (vnode) {
            fetchServiceExecutions(vnode.attrs.name)
                .then(analyseFlakeyTests)
                .then((x) => passFailRates = x)
                .then(_ => m.redraw());
        },
        view: function (vnode) {
            if (passFailRates === null) {
                return m("div", {class: "flakeEntries"},
                    m("p", "Analysing"));
            } else {
                let args = ["div", {class: "flakeEntries"}, "Test Case | Pass Rate %"];
                args = args.concat(passFailRates.map((pfr) => m(FlakeEntry, pfr)));

                return m.apply(this, args);
            }
        },
        onbeforeremove: function(vnode) {
            passFailRates = null;
        }
    }
}

export default {
    view: function (vnode) {
        const serviceName = m.route.param("name");

        return m("div", { class: "resultsView" },
            m(Breadcrumb, {
                breadcrumbs: [m("span", {onclick: () => m.route.set("/")}, "Services"), m("span", serviceName), m("span", "Results")],
                futurecrumbs: [m("span", {onclick: () => m.route.set("/tests", {name: serviceName})}, "Tests")]}),
            m(ResultEntries, { name: serviceName }),
            m(FlakeEntries, { name: serviceName }));
    }
}