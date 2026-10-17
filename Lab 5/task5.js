export default class Student {
    constructor(id, name, courses) {
        this.id = id;
        this.name = name;
        this.courses = courses;
    }
}


export const calculateAverage = (courses) => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((sum, c) => sum + c.marks, 0);
    return total / courses.length;
};
export const calculateGPA = (average) => {
    if (average >= 85) return 4.0;
    if (average >= 70) return 3.0;
    if (average >= 50) return 2.0;
    return 0.0;
};


import Student from './Student.js';
import { calculateAverage as getAverage, calculateGPA } from './gradeUtils.js';

export const processTranscripts = (jsonString) => {
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        throw new SyntaxError("Malformed JSON data provided.");
    }

    const report = [];
    const idSet = new Set();

    for (const record of data) {
        if (!record.id) throw new TypeError("Missing student ID.");
        if (idSet.has(record.id)) throw new Error(`Duplicate ID found: ${record.id}`);
        idSet.add(record.id);

        for (const course of record.courses) {
            if (!course.code) throw new TypeError("Missing course code.");
            if (course.marks < 0 || course.marks > 100) {
                throw new RangeError(`Invalid marks for course ${course.code}`);
            }
        }

        const avg = getAverage(record.courses);
        const gpa = calculateGPA(avg);
        report.push({
            id: record.id,
            name: record.name,
            average: avg,
            gpa: gpa
        });
    }
    return JSON.stringify(report, null, 2);
};


import { processTranscripts } from './transcriptService.js';

const rawData = `[ { "id": 101, "name": "Ali", "courses": [ { "code": "CS301", "marks": 81 }, { "code": "CS302", "marks": 74 } ] } ]`;

try {
    const finalReportJSON = processTranscripts(rawData);
    console.log("Success:", finalReportJSON);
} catch (error) {
    console.error(`Processing Failed [${error.name}]: ${error.message}`);
} finally {
    console.log("Transcript processing attempt finished.");
}