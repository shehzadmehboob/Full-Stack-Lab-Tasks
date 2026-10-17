// Mock asynchronous operations for demonstration
async function fetchFirstDetail() {
    return { data: "Detail 1", isValid: true }; 
}

async function fetchSecondDetail() {
    return { data: "Detail 2", isValid: true }; 
}

function processCombinedPromises() {
    
    return Promise.all([fetchFirstDetail(), fetchSecondDetail()])
        .then(([detail1, detail2]) => {
            
            if (detail1.isValid && detail2.isValid) {
                
                return Promise.resolve("Success: Both details are valid.");
            } else {
                
                return Promise.reject(new Error("Failure: Invalid details detected in fetched data."));
            }
        })
        .catch(error => {
            return Promise.reject(error);
        });
}

// Example usage:
processCombinedPromises()
   .then(result => console.log(result))
   .catch(error => console.error(error.message));