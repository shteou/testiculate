export function fetchResults(service) {
    return fetch('tests/' + service)
    .then(response => response.json())
    .catch(function (err) {
        console.warn('Something went wrong.', err);
    });
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