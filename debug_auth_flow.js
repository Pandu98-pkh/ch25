// Test authentication flow and user context
async function testAuthFlow() {
    console.log('=== Testing Authentication Flow ===');
    
    const loginData = {
        username: 'haky',
        password: 'password123'  // Common test password
    };
    
    try {
        // Test login
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('User data:', result.user);
            console.log('userId:', result.user.userId);
            
            // Simulate setting user in context
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Test retrieval from localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            console.log('Stored user:', storedUser);
            console.log('Stored userId:', storedUser?.userId);
            
            // Test assessment creation
            const assessmentData = {
                studentId: storedUser?.userId || 'anonymous',
                type: 'stress',
                score: 75,
                risk: 'medium',
                notes: 'Test assessment',
                date: new Date().toISOString(),
                category: 'self-assessment',
                assessor: 'self-assessment'
            };
            
            console.log('Creating assessment with data:', assessmentData);
            
            const assessmentResponse = await fetch('http://localhost:5000/api/mental-health/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData)
            });
            
            const assessmentResult = await assessmentResponse.json();
            
            if (assessmentResponse.ok) {
                console.log('✅ Assessment created successfully!');
                console.log('Assessment result:', assessmentResult);
            } else {
                console.log('❌ Assessment creation failed:', assessmentResult);
            }
            
        } else {
            console.log('❌ Login failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Try different common passwords
async function tryLogin(username, passwords) {
    for (const password of passwords) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log(`✅ Success! ${username}:${password}`);
                return { username, password, user: result.user };
            }
        } catch (error) {
            // Continue trying
        }
    }
    return null;
}

async function findWorkingCredentials() {
    console.log('=== Finding Working Credentials ===');
    
    const users = ['haky', 'pandukh', 'adityapratama', 'aguswijaya', 'alice.smith'];
    const commonPasswords = ['password', 'password123', '123456', 'admin', 'student', 'test'];
    
    for (const username of users) {
        console.log(`Trying user: ${username}`);
        const result = await tryLogin(username, commonPasswords);
        if (result) {
            console.log('Found working credentials:', result);
            return result;
        }
    }
    
    console.log('❌ No working credentials found');
    return null;
}

// Run the test
findWorkingCredentials().then(credentials => {
    if (credentials) {
        // Test with working credentials
        localStorage.setItem('user', JSON.stringify(credentials.user));
        console.log('User stored in localStorage');
        console.log('Testing assessment creation...');
        
        // Create test assessment
        const assessmentData = {
            studentId: credentials.user.userId,
            type: 'anxiety',
            score: 65,
            risk: 'moderate',
            notes: 'Debug test assessment',
            date: new Date().toISOString(),
            category: 'self-assessment',
            assessor: 'self-assessment'
        };
        
        fetch('http://localhost:5000/api/mental-health/assessments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Assessment creation result:', result);
        })
        .catch(error => {
            console.error('Assessment creation error:', error);
        });
    }
});
