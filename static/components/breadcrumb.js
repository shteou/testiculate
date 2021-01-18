const joinArray = function(arr, separator) {
    return arr.flatMap(
        (value, index, array) =>
            array.length - 1 !== index // check for the last item
            ? [value, separator]
            : value);
}

const Breadcrumb = {
    view: function(vnode) {
        let breadcrumbs = joinArray(vnode.attrs.breadcrumbs, m("span", " ⇒ "));
        let futurecrumbs = joinArray(vnode.attrs.futurecrumbs, m("span", " ∨ "));

        let allcrumbs = breadcrumbs;
        if(futurecrumbs.length !== 0) {
            allcrumbs = allcrumbs.concat(m("span", " {")).concat(futurecrumbs).concat(m("span", "}"));
        }

        return m("div", {class: "breadcrumb"},
            m("ion-icon", {name: "home"}),
            m("span", allcrumbs));
    }
}