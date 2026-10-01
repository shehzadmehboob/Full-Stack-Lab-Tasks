var name = "Shehzad";
var age = 21;
var city = "Bahawalpur";
var isStudent = true;
var degree = "BS Computer Science";

console.log("Name:", name);
console.log("Age:", age);
console.log("City:", city);
console.log("Student:", isStudent);
console.log("Degree:", degree);


var biography = {
    name: "Shehzad",
    age: 21,
    isStudent: true,

    address: {
        city: "Bahawalpur",
        country: "Pakistan"
    },

    degreeProgram: {
        degree: "BS Computer Science",
        university: "University"
    }
};

console.log("Name:", biography.name);
console.log("Age:", biography.age);
console.log("City:", biography.address.city);
console.log("Country:", biography.address.country);
console.log("Degree:", biography.degreeProgram.degree);