class Person {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    introduce() {
        return `Hi, I am ${this.name}.`;
    }
}

class Student extends Person {
    constructor(name, email, rollNo, marks) {
        super(name, email);
        this.rollNo = rollNo;
        this.marks = marks;
    }
    getResult() {
        return this.marks >= 50 ? 'Pass' : 'Fail';
    }
    introduce() {
        return `${super.introduce()} I am a student with roll number ${this.rollNo}.`;
    }
}

class FacultyMember extends Person {
    constructor(name, email, employeeId, department) {
        super(name, email);
        this.employeeId = employeeId;
        this.department = department;
    }
    introduce() {
        return `${super.introduce()} I work in the ${this.department} department.`;
    }
}

const users = [
    new Student('Ali', 'ali@university.edu', 'S101', 85),
    new FacultyMember('Dr. Sara', 'sara@university.edu', 'F202', 'CS')
];


users.forEach(user => console.log(user.introduce()));

const guest = { name: 'Dr. Ahmed', email: 'ahmed@example.com' };
console.log(Person.prototype.introduce.call(guest)); 

const student = users[0];
const fn = student.introduce;

const boundFn = student.introduce.bind(student);
console.log(boundFn());