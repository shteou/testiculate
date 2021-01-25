export function fetchExecutions(service) {
    return fetch('executions/' + service)
    .then(response => response.json())
    .catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

export function analyseFlakeyTests(testExecutions) {
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

export function isPassed(testResult) {
    return testResult.Failed === 0 && testResult.Errored === 0;
}

export function totalPassed(results) {
    return results.filter(isPassed).length;
}

export function totalFailed(results) {
    return results.filter((x) => !isPassed(x)).length;
}

export function passRate(results) {
    return ~~((results.filter(isPassed).length / results.length) * 100);
}

export function countStatuses(executions, execution, status) {
    return executions
        .filter(x => x.Name === execution.Name && x.Classname === execution.Classname)
        .reduce((a, b) => a + (b.Status === status ? 1 : 0), 0)
}
export function passes(executions, execution) {
    return countStatuses(executions, execution, "passed");
}

export function fails(executions, execution) {
    return countStatuses(executions, execution, "failed") + countStatuses(executions, execution, "errored");
}

export function uniqueTestCases(executions) {
    const unique = [...new Map(executions.map(e =>
        [e.Classname + ":" + e.Name, e])).values()];

    return unique.map(tc => { return {
            name: tc.Name,
            class: tc.Classname,
            passed: passes(executions, tc),
            failed: fails(executions, tc),
        }
    });
}