import Breadcrumb from '../components/breadcrumb.js';
import {fetchServices} from '../models/services.js';

const ServiceEntry = {
    view: function(vnode) {
        return m("div", {class: "serviceEntry"}, 
            m("button", {onclick: () => m.route.set("/results", {name: vnode.attrs.Name})}, vnode.attrs.Name));
    }
}

const ServiceResults = function() {
    let services = null;

    return {
        oninit: function() {
            fetchServices()
            .then(data => services = data)
            .then(_ => m.redraw());
        },
        view: function(vnode) {
            if(services === null) {
                return m("div", {class: "serviceEntries"}, "Searching")
            } else {
                const args = ["div", {class: "serviceResults"}]
                    .concat(services.map(x => m(ServiceEntry, x)));
                return m.apply(this, args);
            }
        },
        onbeforeremove: function(vnode) {
            services = null;
        }
    }  
}

export default function() {
    return {
        view: function(vnode) {
            return m("div", {class: "serviceView"},
                m(Breadcrumb, {
                    breadcrumbs: [m("span", "Services")],
                    futurecrumbs: []}),
                m(ServiceResults));
        }    
    }
}