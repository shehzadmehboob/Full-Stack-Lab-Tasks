const SUPPORTED_PROGRAMS = ['BSCS', 'BSSE', 'BSAI'];

function processAdmissions(applicants) {
    const processedApplicants = [];
    const summary = {
        validCount: 0,
        invalidCount: 0,
        highestMerit: 0,
        lowestMerit: Infinity,
        totalMerit: 0,
        programCounts: {}
    };

    for (const app of applicants) {

        const age = Number(app.age);
        const matric = Number(app.matricMarks);
        const inter = Number(app.intermediateMarks);
        const entry = Number(app.entryTest);
        
        const hasMissingFields = !app.id || !app.name || !app.program;
        const hasInvalidNumbers = isNaN(age) || isNaN(matric) || isNaN(inter) || isNaN(entry);
        const hasInvalidAge = age < 17 || age > 30;
        const hasInvalidMarks = matric < 0 || matric > 100 || inter < 0 || inter > 100 || entry < 0 || entry > 100;
        const isUnsupportedProgram = !SUPPORTED_PROGRAMS.includes(app.program);

        if (hasMissingFields || hasInvalidNumbers || hasInvalidAge || hasInvalidMarks || isUnsupportedProgram) {
            processedApplicants.push({ ...app, status: 'INVALID DATA' });
            summary.invalidCount++;
            continue;
        }

        const merit = (matric * 0.20) + (inter * 0.30) + (entry * 0.50);
        summary.validCount++;
        summary.totalMerit += merit;

        if (merit > summary.highestMerit) summary.highestMerit = merit;
        if (merit < summary.lowestMerit) summary.lowestMerit = merit;

        summary.programCounts[app.program] = (summary.programCounts[app.program] || 0) + 1;

        let status;
        if (merit >= 70 && entry >= 60 && inter >= 60) {
            status = merit >= 80 ? 'SELECTED' : 'WAITING';
        } else {
            status = 'REJECTED';
        }

        processedApplicants.push({ ...app, merit: Number(merit.toFixed(2)), status });
    }

    if (summary.validCount > 0) {
        summary.averageMerit = Number((summary.totalMerit / summary.validCount).toFixed(2));
    } else {
        summary.lowestMerit = 0;
        summary.averageMerit = 0;
    }
    delete summary.totalMerit;

    return { applicants: processedApplicants, summary };
}