async function fetchUserObject(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Unsuccessful fetch: HTTP ${response.status}`);
        }
        
        const user = await response.json();
        return user; 
        
    } catch (error) {
        return error; 
    }
}

fetchUserObject('https://jsonplaceholder.typicode.com/users/1').then(console.log);