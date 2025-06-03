console.log('Testing edit/delete functionality...');

// Test API connection and student data structure
async function testStudentData() {
    try {
        console.log('Fetching students from API...');
        const response = await fetch('http://localhost:5000/api/students');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data && data.data && Array.isArray(data.data)) {
            const students = data.data;
            console.log('Number of students:', students.length);
            
            if (students.length > 0) {
                const firstStudent = students[0];
                console.log('First student structure:', firstStudent);
                console.log('Student has id:', !!firstStudent.id);
                console.log('Student has studentId:', !!firstStudent.studentId);
                console.log('Student name:', firstStudent.name);
                
                // Test edit API
                if (firstStudent.studentId || firstStudent.id) {
                    const studentId = firstStudent.studentId || firstStudent.id;
                    console.log('Testing PATCH update for student:', studentId);
                      try {
                        const updateResponse = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                name: firstStudent.name + ' (TEST)',
                                email: firstStudent.email,
                                tingkat: firstStudent.tingkat,
                                kelas: firstStudent.kelas,
                                academicStatus: firstStudent.academicStatus
                            })
                        });
                        
                        if (updateResponse.ok) {
                            const updateData = await updateResponse.json();
                            console.log('Update successful:', updateData);
                              // Restore original name
                            await fetch(`http://localhost:5000/api/students/${studentId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    name: firstStudent.name,
                                    email: firstStudent.email,
                                    tingkat: firstStudent.tingkat,
                                    kelas: firstStudent.kelas,
                                    academicStatus: firstStudent.academicStatus
                                })
                            });
                            console.log('Original name restored');
                        } else {
                            console.error('Update failed:', updateResponse.status, await updateResponse.text());
                        }
                    } catch (updateError) {
                        console.error('Update error:', updateError);
                    }
                }
            }
        } else {
            console.error('Invalid API response structure');
        }
    } catch (error) {
        console.error('API test failed:', error);
    }
}

// Test function availability in React context
function testFunctionTypes() {
    console.log('Testing function types...');
    
    // Mock functions to test
    const mockOnEdit = (student) => {
        console.log('Mock onEdit called with:', student);
    };
    
    const mockOnDelete = (student) => {
        console.log('Mock onDelete called with:', student);
    };
    
    console.log('mockOnEdit type:', typeof mockOnEdit);
    console.log('mockOnDelete type:', typeof mockOnDelete);
    console.log('mockOnEdit exists:', !!mockOnEdit);
    console.log('mockOnDelete exists:', !!mockOnDelete);
}

// Run tests
testStudentData();
testFunctionTypes();
