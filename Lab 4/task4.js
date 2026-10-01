function roundMe() {

    if (arguments.length === 0) {
        return 0;
    }

    if (arguments.length === 1) {
        return Math.round(arguments[0]);
    }

    var result = [];

    for (var i = 0; i < arguments.length; i++) {
        result.push(Math.round(arguments[i]));
    }

    return result;
}

console.log(roundMe());
console.log(roundMe(4.7));
console.log(roundMe(4.7, 4.4));
console.log(roundMe(2.3, 5.8, 7.2));