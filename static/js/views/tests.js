import Breadcrumb from '../components/breadcrumb.js';
import {fetchExecutions, uniqueTestCases} from '../models/executions.js'

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
    let unique = null;

    return {
        oninit: function (vnode) {
            const serviceName = vnode.attrs.name;
            fetchExecutions(serviceName)
                .then((data) => unique = uniqueTestCases(data))
                .then(_ => m.redraw());
        },
        view: function(vnode) {
            if(unique === null) {
                return m("span", "Loading");
            } else {
                let nodes = ["div", {class: "testDetails"}]
                    .concat(unique.map((tc) => m(TestDetail, tc)))
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