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
            return this.findOne(element => element.id === id);
        },
        findOne: function (predicate) {
            return elements.filter(predicate)[0];
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