const Breadcrumb = {
    view: function(vnode) {
        let breadcrumbs = vnode.attrs.breadcrumbs.join(" ⇾ ");
        return m("div", {class: "breadcrumb"},
            m("ion-icon", {name: "home"}),
            m("span", breadcrumbs));
    }
}