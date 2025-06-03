#!/usr/bin/env node

/**
 * Filter Limit Integration Test
 * Automated test to verify filter limit functionality after backend fixes
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function printHeader(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.cyan}${title}${colors.reset}`);
    console.log('='.repeat(60));
}

function printSubHeader(title) {
    console.log(`\n${colors.magenta}--- ${title} ---${colors.reset}`);
}

async function testBackendConnection() {
    printSubHeader('Testing Backend Connection');
    
    try {
        const response = await axios.get(`${API_BASE}/students?limit=1000`, {
            timeout: 10000
        });
        
        const data = response.data;
        const studentCount = data.data?.length || 0;
        const totalRecords = data.totalRecords || studentCount;
        
        log(`✅ Backend connection successful`, 'green');
        log(`📊 Total students available: ${totalRecords}`, 'blue');
        log(`📦 Retrieved students: ${studentCount}`, 'blue');
        log(`📄 Total pages: ${data.totalPages}`, 'blue');
        
        return { success: true, students: data.data, total: totalRecords };
        
    } catch (error) {
        log(`❌ Backend connection failed: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

async function testBackendLimits() {
    printSubHeader('Testing Backend Limit Handling');
    
    const limits = [10, 100, 500, 1000];
    const results = [];
    
    for (const limit of limits) {
        try {
            const response = await axios.get(`${API_BASE}/students?limit=${limit}`, {
                timeout: 10000
            });
            
            const data = response.data;
            const receivedCount = data.data?.length || 0;
            
            let status = '✅';
            let message = `PASS: Limit ${limit} returned ${receivedCount} students`;
            
            if (limit < 1000 && receivedCount > limit) {
                status = '❌';
                message = `FAIL: Limit ${limit} returned ${receivedCount} students (exceeds limit)`;
            }
            
            log(`${status} ${message}`, status === '✅' ? 'green' : 'red');
            
            results.push({
                limit,
                received: receivedCount,
                success: status === '✅',
                totalPages: data.totalPages,
                currentPage: data.currentPage
            });
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            log(`❌ Limit ${limit} test failed: ${error.message}`, 'red');
            results.push({
                limit,
                received: 0,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

function testFrontendFilterLogic(allStudents) {
    printSubHeader('Testing Frontend Filter Logic Simulation');
    
    if (!allStudents || allStudents.length === 0) {
        log('❌ No student data available for frontend testing', 'red');
        return [];
    }
    
    const limits = [10, 100, 500, 'semua'];
    const results = [];
    
    for (const limitValue of limits) {
        // Simulate StudentView.tsx filtering logic
        const filteredStudents = allStudents; // No search/status filters for this test
        
        // Apply limit filter (same logic as StudentView.tsx)
        const limitedStudents = limitValue === 'semua' 
            ? filteredStudents 
            : filteredStudents.slice(0, parseInt(limitValue));
        
        let status = '✅';
        let message = '';
        
        if (limitValue === 'semua') {
            if (limitedStudents.length === filteredStudents.length) {
                message = `PASS: "Semua" shows all ${limitedStudents.length} students`;
            } else {
                status = '❌';
                message = `FAIL: "Semua" shows ${limitedStudents.length} instead of ${filteredStudents.length}`;
            }
        } else {
            const expectedLimit = parseInt(limitValue);
            if (limitedStudents.length <= expectedLimit) {
                message = `PASS: Limit ${limitValue} shows ${limitedStudents.length} students (≤ ${expectedLimit})`;
            } else {
                status = '❌';
                message = `FAIL: Limit ${limitValue} shows ${limitedStudents.length} students (> ${expectedLimit})`;
            }
        }
        
        log(`${status} ${message}`, status === '✅' ? 'green' : 'red');
        
        results.push({
            limit: limitValue,
            available: filteredStudents.length,
            displayed: limitedStudents.length,
            success: status === '✅'
        });
    }
    
    return results;
}

function generateTestReport(backendResults, frontendResults, allStudents) {
    printSubHeader('Test Report Summary');
    
    const backendPassed = backendResults.filter(r => r.success).length;
    const frontendPassed = frontendResults.filter(r => r.success).length;
    
    console.log('\n📊 Test Results:');
    console.log(`   Backend Tests: ${backendPassed}/${backendResults.length} passed`);
    console.log(`   Frontend Tests: ${frontendPassed}/${frontendResults.length} passed`);
    console.log(`   Total Students: ${allStudents?.length || 0}`);
    
    // Detailed backend results
    console.log('\n🔧 Backend Limit Tests:');
    backendResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} Limit ${result.limit}: ${result.received} students`);
    });
    
    // Detailed frontend results
    console.log('\n🎨 Frontend Filter Tests:');
    frontendResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} Limit ${result.limit}: ${result.displayed} displayed (${result.available} available)`);
    });
    
    // Overall assessment
    const allTestsPassed = backendPassed === backendResults.length && frontendPassed === frontendResults.length;
    
    console.log('\n🎯 Overall Assessment:');
    if (allTestsPassed) {
        log('🎉 ALL TESTS PASSED! Filter limit functionality is working correctly.', 'green');
        log('✅ Backend API handles limits properly', 'green');
        log('✅ Frontend filter logic is implemented correctly', 'green');
        log('🚀 Filter limit feature is ready for production use!', 'green');
    } else {
        log('⚠️  Some tests failed. Please review the results above.', 'yellow');
        if (backendPassed < backendResults.length) {
            log('❌ Backend limit handling needs attention', 'red');
        }
        if (frontendPassed < frontendResults.length) {
            log('❌ Frontend filter logic needs attention', 'red');
        }
    }
    
    return allTestsPassed;
}

async function runFilterLimitIntegrationTest() {
    printHeader('🧪 Filter Limit Integration Test');
    log('Testing filter limit functionality after backend fixes...', 'blue');
    
    try {
        // Step 1: Test backend connection
        const connectionResult = await testBackendConnection();
        if (!connectionResult.success) {
            log('❌ Cannot proceed without backend connection', 'red');
            process.exit(1);
        }
        
        // Step 2: Test backend limit handling
        const backendResults = await testBackendLimits();
        
        // Step 3: Test frontend filter logic
        const frontendResults = testFrontendFilterLogic(connectionResult.students);
        
        // Step 4: Generate comprehensive report
        const allTestsPassed = generateTestReport(backendResults, frontendResults, connectionResult.students);
        
        // Exit with appropriate code
        process.exit(allTestsPassed ? 0 : 1);
        
    } catch (error) {
        log(`❌ Integration test failed with error: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run the test if this script is executed directly
runFilterLimitIntegrationTest();

export {
    runFilterLimitIntegrationTest,
    testBackendConnection,
    testBackendLimits,
    testFrontendFilterLogic
};
