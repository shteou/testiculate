export function fetchServices() {
    return fetch('services')
    .then(response => response.json())
    .catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}
