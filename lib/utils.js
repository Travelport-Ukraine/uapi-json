var Utils = {
    price: function(string) {
        return {
            currency: string.slice(0,3),
            value: 1.0 * string.slice(3, string.length)
        }
    },
    beautifyName: function(string) {
        return string.split(' ').map(function(name) {
            return name[0] + name.slice(1).toLowerCase();
        }).join(' ');
    },
};
module.exports = Utils;