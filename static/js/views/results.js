import Breadcrumb from '../components/breadcrumb.js';
import {fetchResults} from '../models/results.js';
import {fetchExecutions, analyseFlakeyTests, isPassed, totalPassed, totalFailed, passRate} from '../models/executions.js';
import {groupBy} from '../util.js'

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

    return {
        oninit: function(vnode) {
            fetchResults(vnode.attrs.name)
                .then(data => results = data)
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
                    // test results aver multiple days, clamp to the nearest 2 seconds to generate better looking fake data
                    batchedDate.setMilliseconds(0)
                    batchedDate.setSeconds(~~(batchedDate.getSeconds() / 2))
                    x.CreatedAtBatched = `${batchedDate.getHours()}${batchedDate.getSeconds()}`;
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

    return {
        oninit: function (vnode) {
            fetchExecutions(vnode.attrs.name)
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