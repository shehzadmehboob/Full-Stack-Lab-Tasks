function updateStudentProfile(original, updateData) {
    return {
        ...original,
        ...updateData,
        address: {
            ...original.address,
            ...(updateData.address ?? {})
        },
        contact: {
            ...original.contact,
            ...(updateData.contact ?? {})
        }
    };
}


function verifyReferences(original, updated) {
    console.log("Original vs Updated Object:", original === updated ? "Equal" : "Different"); 
    
    console.log("Original vs Updated Address:", original.address === updated.address ? "Equal" : "Different");
    
    console.log("Original vs Updated Contact:", original.contact === updated.contact ? "Equal" : "Different");
}