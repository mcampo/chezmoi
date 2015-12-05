function createStore() {
    var elements = [];
    return {
        all: function () {
            return elements;
        },
        add: function (element) {
            elements.push(element);
        },
        get: function (id) {
            var filtered = elements.filter(function (element) {
                return element.id === id;
            });
            return filtered.length > 0 ? filtered[0] : null;
        },
        remove: function (elementToRemove) {
            elements.splice(elements.indexOf(elementToRemove), 1);
        }
    };
}

module.exports = {
    hubs: createStore(),
    devices: createStore()
};