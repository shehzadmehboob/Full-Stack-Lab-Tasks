const processResults = (results) => results.map(student => {
    let grade, gradePoints, status = 'Pass';
    const m = student.marks;
    if (m >= 85 && m <= 100) { grade = 'A'; gradePoints = 4.0; }
    else if (m >= 80) { grade = 'A-'; gradePoints = 3.7; }
    else if (m >= 75) { grade = 'B+'; gradePoints = 3.3; }
    else if (m >= 70) { grade = 'B'; gradePoints = 3.0; }
    else if (m >= 65) { grade = 'B-'; gradePoints = 2.7; }
    else if (m >= 60) { grade = 'C+'; gradePoints = 2.3; }
    else if (m >= 50) { grade = 'C'; gradePoints = 2.0; }
    else { grade = 'F'; gradePoints = 0.0; status = 'Fail'; }
    
    return { ...student, grade, gradePoints, status };
});


const getRankedList = (results) => {
    return [...results].sort((a, b) => {
        if (b.marks !== a.marks) return b.marks - a.marks;
        return a.name.localeCompare(b.name);
    });
};


const getDepartmentStats = (results) => {
    return results.reduce((acc, student) => {
        const dept = student.department;
        if (!acc[dept]) {
            acc[dept] = { students: 0, average: 0, highest: 0, passed: 0, _totalMarks: 0 };
        }
        acc[dept].students++;
        acc[dept]._totalMarks += student.marks;
        acc[dept].highest = Math.max(acc[dept].highest, student.marks);
        if (student.marks >= 50) acc[dept].passed++;
        acc[dept].average = Number((acc[dept]._totalMarks / acc[dept].students).toFixed(2));
        return acc;
    }, {});
};


const runQueries = (results) => {
    const firstAbove85 = results.find(s => s.marks > 85);
    const firstFailedIndex = results.findIndex(s => s.marks < 50);
    const hasFailures = results.some(s => s.marks < 50);
    const allValidMarks = results.every(s => s.marks >= 0 && s.marks <= 100);
    
    const overallAvg = results.reduce((sum, s) => sum + s.marks, 0) / results.length;
    const aboveAverage = results.filter(s => s.marks > overallAvg);
    
    const topThreeNames = getRankedList(results).slice(0, 3).map(s => s.name);
    
    return { firstAbove85, firstFailedIndex, hasFailures, allValidMarks, aboveAverage, topThreeNames };
};