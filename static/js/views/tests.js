import Breadcrumb from '../components/breadcrumb.js';

const TestDetail = {
    view: function(vnode) {
        return m("div", {class: "testDetail"},
            m("div", {class: "testDetailName"},
                m("span", vnode.attrs.class),
                m("span", ":" + vnode.attrs.name)),
            m("div", {class: "testDetailStatuses"},
                m("span", "passed: " + vnode.attrs.passed),
                m("span", "failed: " + vnode.attrs.failed)));
    }
}
const TestsDetails = function() {
    let serviceName = null;

    let executions = null;

    const fetchServiceExecutions = function (service) {
        return fetch('http://localhost:8080/executions/' + serviceName)
            .then(response => response.json())
            .catch(function (err) {
                console.warn('Something went wrong.', err);
            });
    }

    const countStatuses = function(executions, execution, status) {
        return executions
            .filter(x => x.Name === execution.Name && x.Classname === execution.Classname)
            .reduce((a, b) => a + (b.Status === status ? 1 : 0), 0)
    }
    const passes = function(executions, execution) {
        return countStatuses(executions, execution, "passed");
    }

    const fails = function(executions, execution) {
        return countStatuses(executions, execution, "failed") + countStatuses(executions, execution, "errored");
    }

    const getTestCases = function(executions) {
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

    return {
        oninit: function (vnode) {
            serviceName = vnode.attrs.name;
            fetchServiceExecutions(vnode.attrs.name)
                .then((data) => executions = data)
                .then(_ => m.redraw());
        },
        view: function(vnode) {
            if(executions === null) {
                return m("span", "Loading");
            } else {
                const testCases = getTestCases(executions);
                let nodes = ["div", {class: "testDetails"}]
                    .concat(testCases.map((tc) => m(TestDetail, tc)))
                return m.apply(this, nodes);
            }
        }
    }
}

export default function() {
    const serviceName = m.route.param("name");

    return {
        view: function(vnode) {
            return m("div", {class: "testsView"},
                m(Breadcrumb, {
                    breadcrumbs: [m("span", "Services"), m("span", serviceName), m("span", "Tests")],
                    futurecrumbs: []}),
                m(TestsDetails, {name: serviceName}));
        }
    }
}