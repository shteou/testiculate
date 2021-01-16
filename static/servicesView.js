let servicesState = {
    services: null
}

function fetchServices() {
    return fetch('http://localhost:8080/services')
    .then(response => response.json())
    .then(data => {
        servicesState.services = data;
        m.redraw();
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

const ServiceEntry = {
    view: function(vnode) {
        return m("div", {class: "serviceEntry"}, 
            m("button", {onclick: () => m.route.set("/results/" + vnode.attrs.ID, {name: vnode.attrs.Name})}, vnode.attrs.Name));
    }
}

const ServiceResults = {
    oninit: function() {
        fetchServices()
        .then(_ => m.redraw());
    },
    view: function(vnode) {
        if(servicesState.services === null) {
            return m("div", {class: "serviceEntries"}, "Searching")
        } else {
            const args = ["div", {class: "serviceResults"}]
                .concat(servicesState.services.map(x => m(ServiceEntry, x)));
            return m.apply(this, args);
        }
    }
}

const ServiceView = {
    view: function(vnode) {
        return m("div", {class: "serviceView"},
            m("p", "Services"),
            m(ServiceResults));
    }
}