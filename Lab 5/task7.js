const getStudent = (id) => Promise.resolve({ id, name: 'Ali' });
const getCourse = (code) => Promise.resolve({ code, title: 'Adv JS' });
const checkPrerequisites = (student, course) => Promise.resolve({ student, course, valid: true });
const checkSeats = (data) => Promise.resolve({ ...data, seats: true });
const registerStudent = (data) => Promise.resolve({ studentId: data.student.id, status: 'REGISTERED' });


getStudent(101)
    .then(student => getCourse('CS401').then(course => ({ student, course })))
    .then(({ student, course }) => checkPrerequisites(student, course))
    .then(data => checkSeats(data))
    .then(data => registerStudent(data))
    .then(result => {
        console.log("Registration Successful:", result);
        runPostRegistration();
    })
    .catch(error => console.error("Registration Failed:", error))
    .finally(() => console.log("Registration process terminated."));


function runPostRegistration() {
    const sendEmail = () => Promise.resolve("Email Sent");
    const sendSMS = () => Promise.reject("SMS Gateway Timeout");
    const writeAuditLog = () => Promise.resolve("Audit Logged");

    Promise.allSettled([sendEmail(), sendSMS(), writeAuditLog()])
        .then(results => {
            const report = results.map((res, index) => {
                const serviceNames = ['Email', 'SMS', 'Audit'];
                return { service: serviceNames[index], status: res.status };
            });
            console.log("Post-Registration Report:", report);
        });
}


const server1 = () => Promise.reject("Server 1 Down");
const server2 = () => Promise.resolve({ code: 'CS401', data: 'Server 2 Data' });


Promise.any([server1(), server2()])
    .then(course => console.log("First available server returned:", course))
    .catch(err => console.error("All servers failed:", err));