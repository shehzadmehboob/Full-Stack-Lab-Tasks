const fakeFetch = async (url) => {
    return {
        ok: true,
        json: async () => {
            if (url === '/users') return [{ id: 1, name: 'Ali' }, { id: 2, name: 'Sara' }];
            if (url === '/courses') return [{ code: 'CS101' }, { code: 'CS102' }];
            if (url === '/results') return [
                { id: 1, marks: 85, department: 'CS' }, 
                { id: 2, marks: 40, department: 'SE' }
            ];
        }
    };
};


async function getJSON(url, fetchImplementation = fakeFetch, options = {}) {
    const response = await fetchImplementation(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
}


async function loadDashboard() {
    try {

        const [users, courses, results] = await Promise.all([
            getJSON('/users'),
            getJSON('/courses'),
            getJSON('/results')
        ]);

        let totalMarks = 0;
        let highest = { marks: -1 };
        let failedCount = 0;
        const deptStats = {};

        results.forEach(res => {
            totalMarks += res.marks;
            if (res.marks > highest.marks) highest = res;
            if (res.marks < 50) failedCount++;
            
            if (!deptStats[res.department]) deptStats[res.department] = 0;
            deptStats[res.department]++;
        });

        const dashboardData = {
            totalStudents: users.length,
            totalCourses: courses.length,
            overallAverage: totalMarks / results.length,
            highestPerformer: users.find(u => u.id === highest.id)?.name,
            failedStudents: failedCount,
            departmentStatistics: deptStats
        };
        console.log("Dashboard:", dashboardData);

    } catch (error) {
        console.error("Dashboard Load Failed:", error);
    }
}


async function fetchWithTimeout(url, milliseconds) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), milliseconds);

    try {
        
        return await getJSON(url, fetch, { signal: controller.signal });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}