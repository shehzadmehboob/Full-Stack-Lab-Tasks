function loadStudent(studentId, callback) {
    setTimeout(() => {
        if (!studentId) callback(new Error("Student does not exist"), null);
        else callback(null, { id: studentId, name: 'Ali' });
    }, 100);
}

function checkPrerequisites(student, course, callback) {
    setTimeout(() => {
        if (course === 'CS401' && student.id === 101) callback(null, true);
        else callback(new Error("Prerequisite not completed"), null);
    }, 100);
}

function checkAvailableSeats(course, callback) {
    setTimeout(() => {
        const seatsAvailable = true; // Simulate condition
        if (seatsAvailable) callback(null, true);
        else callback(new Error("Course is full"), null);
    }, 100);
}

function registerCourse(student, course, callback) {
    setTimeout(() => {
        const alreadyRegistered = false; // Simulate condition
        if (alreadyRegistered) callback(new Error("Student already registered"), null);
        else callback(null, { studentId: student.id, course: course, status: 'REGISTERED' });
    }, 100);
}


loadStudent(101, (err1, student) => {
    if (err1) return console.error(err1);
    
    checkPrerequisites(student, 'CS401', (err2, hasPrereqs) => {
        if (err2) return console.error(err2);
        
        checkAvailableSeats('CS401', (err3, hasSeats) => {
            if (err3) return console.error(err3);
            
            registerCourse(student, 'CS401', (err4, confirmation) => {
                if (err4) return console.error(err4);
                console.log("Success:", confirmation);
            });
        });
    });
});