#!/usr/bin/env node
/**
 * Test script to verify the enhanced DeletedStudentsManagement fallback functionality
 * This script simulates the exact logic used in the React component
 */

import https from 'https';
import http from 'http';

const API_BASE = 'http://localhost:5000/api';

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

async function testEnhancedFallbackLogic() {
    console.log('🚀 Testing Enhanced DeletedStudentsManagement Fallback Logic');
    console.log('================================================================');
    
    try {
        // Step 1: Fetch deleted students (primary endpoint)
        console.log('\n1️⃣ Fetching deleted students from primary endpoint...');
        const studentsData = await makeRequest(`${API_BASE}/admin/students/deleted`);
        console.log(`✅ Found ${studentsData.length} deleted students`);
        
        // Step 2: Process and detect missing data (same logic as React component)
        console.log('\n2️⃣ Analyzing data completeness...');
        const studentsWithMissingData = studentsData.filter(student => 
            student.name === 'Unknown Student' || 
            student.name.startsWith('Student ') || 
            !student.email || 
            !student.userId
        );
        
        console.log(`📊 Students with missing data: ${studentsWithMissingData.length}/${studentsData.length}`);
        
        if (studentsWithMissingData.length > 0) {
            console.log('📋 Students needing enrichment:');
            studentsWithMissingData.forEach((student, index) => {
                console.log(`   ${index + 1}. ${student.studentId}: ${student.name} (${student.email || 'no email'})`);
            });
            
            // Step 3: Fetch user data for enrichment
            console.log('\n3️⃣ Fetching user data for enrichment...');
            const userData = await makeRequest(`${API_BASE}/admin/users/deleted`);
            const studentUsers = userData.filter(user => user.role === 'student');
            console.log(`✅ Found ${studentUsers.length} deleted student users`);
            
            // Step 4: Create enrichment map
            console.log('\n4️⃣ Creating user data mapping...');
            const userDataMap = new Map();
            studentUsers.forEach(user => {
                userDataMap.set(user.userId || user.id, user);
                console.log(`   📝 Mapped ${user.userId || user.id}: ${user.name} (${user.email})`);
            });
            
            // Step 5: Enrich student data
            console.log('\n5️⃣ Enriching student data...');
            let enrichedCount = 0;
            const enrichedStudents = studentsData.map(student => {
                if (studentsWithMissingData.includes(student)) {
                    const userData = userDataMap.get(student.studentId);
                    if (userData) {
                        enrichedCount++;
                        console.log(`   ✨ Enriched ${student.studentId}: "${student.name}" → "${userData.name}"`);
                        console.log(`      Email: "${student.email}" → "${userData.email}"`);
                        return {
                            ...student,
                            name: userData.name || student.name,
                            email: userData.email || student.email,
                            username: userData.username || student.username,
                            photo: userData.photo || student.photo,
                            userId: userData.userId || userData.id || student.userId,
                            user_id: userData.userId || userData.id || student.user_id,
                            userTableId: userData.userId || userData.id,
                            userTableName: userData.name,
                            userTableEmail: userData.email,
                            userTablePhoto: userData.photo
                        };
                    } else {
                        console.log(`   ⚠️  No user data found for ${student.studentId}`);
                    }
                }
                return student;
            });
            
            // Step 6: Show results
            console.log('\n6️⃣ Enrichment Results:');
            console.log(`✅ Successfully enriched ${enrichedCount}/${studentsWithMissingData.length} students`);
            console.log(`📈 Data completeness improved from ${((studentsData.length - studentsWithMissingData.length) / studentsData.length * 100).toFixed(1)}% to ${((studentsData.length - studentsWithMissingData.length + enrichedCount) / studentsData.length * 100).toFixed(1)}%`);
            
            console.log('\n📊 Final Dataset:');
            enrichedStudents.forEach((student, index) => {
                const enriched = student.userTableName ? ' (enriched)' : '';
                console.log(`   ${index + 1}. ${student.studentId}: ${student.name} (${student.email})${enriched}`);
            });
            
        } else {
            console.log('✅ All students have complete data, no enrichment needed');
        }
        
        console.log('\n🎉 Enhanced fallback logic test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Test complete fallback scenario
        console.log('\n🔄 Testing complete fallback scenario...');
        try {
            const fallbackData = await makeRequest(`${API_BASE}/admin/users/deleted`);
            const studentUsers = fallbackData.filter(user => user.role === 'student');
            console.log(`✅ Fallback successful: Found ${studentUsers.length} students in users table`);
            
            console.log('📋 Fallback data:');
            studentUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.userId}: ${user.name} (${user.email})`);
            });
            
        } catch (fallbackError) {
            console.error('❌ Complete fallback also failed:', fallbackError.message);
        }
    }
}

// Run the test
testEnhancedFallbackLogic().catch(console.error);
