const ServiceEntry = {
    view: function(vnode) {
        return m("div", {class: "serviceEntry"}, 
            m("button", {onclick: () => m.route.set("/results/" + vnode.attrs.ID, {name: vnode.attrs.Name})}, vnode.attrs.Name));
    }
}

const ServiceResults = function() {
    let servicesState = null;

    const fetchServices = function() {
        return fetch('http://localhost:8080/services')
        .then(response => response.json())
        .catch(function (err) {
            console.warn('Something went wrong.', err);
        });
    }

    return {
        oninit: function() {
            fetchServices()
            .then(data => servicesState = data)
            .then(_ => m.redraw());
        },
        view: function(vnode) {
            if(servicesState === null) {
                return m("div", {class: "serviceEntries"}, "Searching")
            } else {
                const args = ["div", {class: "serviceResults"}]
                    .concat(servicesState.map(x => m(ServiceEntry, x)));
                return m.apply(this, args);
            }
        },
        onbeforeremove: function(vnode) {
            servicesState = null;
        }
    }
    
}


const ServiceView = function() {

    return {
        view: function(vnode) {
            return m("div", {class: "serviceView"},
                m("p", "Services"),
                m(ServiceResults));
        }    
    }
}