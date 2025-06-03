/**
 * Test Data Generator for StudentTable Performance Testing
 * Generates 1200+ students for comprehensive performance validation
 */

const API_BASE = 'http://localhost:5000/api';

// Sample data templates
const firstNames = [
    'Alex', 'Blake', 'Casey', 'Dakota', 'Ellis', 'Finley', 'Gabriel', 'Harper', 'Indigo', 'Jordan',
    'Kai', 'Logan', 'Morgan', 'Noah', 'Ocean', 'Phoenix', 'Quinn', 'River', 'Sage', 'Taylor',
    'Uma', 'Val', 'Winter', 'Xander', 'Yale', 'Zara', 'Ava', 'Ben', 'Clara', 'David',
    'Emma', 'Felix', 'Grace', 'Henry', 'Isla', 'Jack', 'Kate', 'Liam', 'Mia', 'Nathan',
    'Olivia', 'Peter', 'Queen', 'Ryan', 'Sofia', 'Thomas', 'Una', 'Victor', 'Willow', 'Xavier'
];

const lastNames = [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Hughes', 'Ivanov', 'Johnson',
    'Kim', 'Lopez', 'Martinez', 'Nielsen', 'O\'Connor', 'Patel', 'Quinn', 'Rodriguez', 'Smith', 'Taylor',
    'Upton', 'Vargas', 'Williams', 'Xu', 'Yang', 'Zhang', 'Adams', 'Baker', 'Clark', 'Diaz',
    'Edwards', 'Fisher', 'Green', 'Hall', 'Ingram', 'Jones', 'King', 'Lee', 'Miller', 'Nelson',
    'Parker', 'Roberts', 'Scott', 'Turner', 'Underwood', 'Valdez', 'White', 'Young', 'Zimmerman'
];

const programs = [
    'Computer Science', 'Business Administration', 'Engineering', 'Psychology', 'Biology',
    'Mathematics', 'English Literature', 'History', 'Chemistry', 'Physics',
    'Art & Design', 'Music', 'Philosophy', 'Economics', 'Political Science',
    'Sociology', 'Anthropology', 'Environmental Science', 'Nursing', 'Education'
];

const academicStatuses = ['excellent', 'good', 'satisfactory', 'needs_improvement'];
const classes = ['A', 'B', 'C', 'D', 'E'];
const grades = [9, 10, 11, 12];

function generateStudentId() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `S${year}${random}`;
}

function generateEmail(firstName, lastName) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateStudent(index) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const studentId = generateStudentId();
    
    return {
        id: studentId,
        studentId: studentId,
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        program: getRandomElement(programs),
        academicStatus: getRandomElement(academicStatuses),
        class: getRandomElement(classes),
        grade: getRandomElement(grades),
        kelas: getRandomElement(classes),
        tingkat: getRandomElement(grades),
        lastCounseling: Math.random() > 0.3 ? generateRandomDate(new Date(2024, 0, 1), new Date()).toISOString() : null,
        mentalHealthScore: Math.random() > 0.2 ? Math.floor(Math.random() * 100) + 1 : null,
        avatar: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}` : '',
        photo: Math.random() > 0.7 ? `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}` : ''
    };
}

async function createStudent(student) {
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(student)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to create student ${student.name}:`, error.message);
        return null;
    }
}

async function generateTestDataset(targetCount = 1200) {
    console.log(`🚀 Starting test data generation for ${targetCount} students...`);
    
    // Check current student count
    try {
        const response = await fetch(`${API_BASE}/students`);
        const data = await response.json();
        const currentCount = data.totalRecords || 0;
        
        console.log(`📊 Current student count: ${currentCount}`);
        
        if (currentCount >= targetCount) {
            console.log(`✅ Already have ${currentCount} students (target: ${targetCount}). Skipping generation.`);
            return currentCount;
        }
        
        const studentsToCreate = targetCount - currentCount;
        console.log(`📝 Need to create ${studentsToCreate} additional students...`);
        
        const batchSize = 50; // Create students in batches
        let created = 0;
        let failed = 0;
        
        for (let i = 0; i < studentsToCreate; i += batchSize) {
            const batchEnd = Math.min(i + batchSize, studentsToCreate);
            const batch = [];
            
            // Generate batch
            for (let j = i; j < batchEnd; j++) {
                batch.push(generateStudent(currentCount + j));
            }
            
            // Create batch with concurrent requests (limited concurrency)
            console.log(`🔄 Creating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(studentsToCreate/batchSize)} (${batch.length} students)...`);
            
            const batchPromises = batch.map(student => createStudent(student));
            const results = await Promise.all(batchPromises);
            
            // Count successes and failures
            const batchCreated = results.filter(result => result !== null).length;
            const batchFailed = results.filter(result => result === null).length;
            
            created += batchCreated;
            failed += batchFailed;
            
            console.log(`✅ Batch completed: ${batchCreated} created, ${batchFailed} failed`);
            
            // Small delay between batches to avoid overwhelming the server
            if (i + batchSize < studentsToCreate) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`🎉 Test data generation completed!`);
        console.log(`📊 Final statistics:`);
        console.log(`   - Students created: ${created}`);
        console.log(`   - Failed creations: ${failed}`);
        console.log(`   - Total students: ${currentCount + created}`);
        
        return currentCount + created;
        
    } catch (error) {
        console.error('❌ Failed to generate test dataset:', error.message);
        return 0;
    }
}

// CLI execution
if (typeof window === 'undefined') {
    // Node.js environment
    const targetCount = process.argv[2] ? parseInt(process.argv[2]) : 1200;
    generateTestDataset(targetCount);
} else {
    // Browser environment - make functions available globally
    window.generateTestDataset = generateTestDataset;
    window.generateStudent = generateStudent;
    console.log('🔧 Test data generator loaded. Use generateTestDataset(count) to create test students.');
}
