// Test script to verify the transformation logic
const sampleBackendData = {
  "createdAt": "2025-05-29T07:16:04",
  "date": "2025-05-29T07:16:04",
  "id": "riasec-1748477764-1103220016",
  "interests": ["Investigative", "Realistic"],
  "notes": "Updated test assessment for integration testing",
  "recommendedPaths": ["Engineering", "Computer Science", "Data Science"],
  "results": {
    "artistic": 45,
    "conventional": 70,
    "enterprising": 55,
    "investigative": 90,
    "realistic": 85,
    "social": 60
  },
  "skills": ["problem_solving", "technical"],
  "studentEmail": "pandukayahakiki98@gmail.com",
  "studentId": "1103220016",
  "studentName": "PANDU KAYA HAKIKI",
  "type": "riasec",
  "updatedAt": "2025-05-29T08:26:17",
  "values": ["achievement", "independence"]
};

// Simulate the transformation logic
const transformAssessment = (backendAssessment) => {
  const baseAssessment = {
    id: backendAssessment.id,
    studentId: backendAssessment.studentId,
    date: backendAssessment.date,
    type: backendAssessment.type,
    interests: Array.isArray(backendAssessment.interests) 
      ? backendAssessment.interests 
      : backendAssessment.interests?.split(',').filter(Boolean) || [],
    skills: Array.isArray(backendAssessment.skills) 
      ? backendAssessment.skills 
      : backendAssessment.skills?.split(',').filter(Boolean) || [],
    values: Array.isArray(backendAssessment.values) 
      ? backendAssessment.values 
      : backendAssessment.values?.split(',').filter(Boolean) || [],
    recommendedPaths: Array.isArray(backendAssessment.recommendedPaths) 
      ? backendAssessment.recommendedPaths 
      : backendAssessment.recommendedPaths?.split(',').filter(Boolean) || [],
    notes: backendAssessment.notes || '',
    interestAreas: Array.isArray(backendAssessment.interests) 
      ? backendAssessment.interests 
      : backendAssessment.interests?.split(',').filter(Boolean) || []
  };

  // Add extended properties if present
  if (backendAssessment.results && typeof backendAssessment.results === 'object') {
    if (backendAssessment.type === 'riasec') {
      // Create a complete RiasecResult object from backend data
      const riasecScores = backendAssessment.results;
      
      // Calculate top categories (sort by score, take top 3)
      const sortedCategories = Object.entries(riasecScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      // Generate basic career recommendations
      const generateBasicCareerRecommendations = (topCategories, scores) => {
        const careerDatabase = {
          'realistic': [
            { title: 'Engineer', match: scores.realistic, description: 'Design and build systems', categories: ['realistic'], educationRequired: 'Bachelor\'s Degree', salary: { min: 8000000, max: 15000000, currency: 'IDR' }, outlookGrowth: 8 }
          ],
          'investigative': [
            { title: 'Scientist', match: scores.investigative, description: 'Conduct research and experiments', categories: ['investigative'], educationRequired: 'Master\'s Degree', salary: { min: 10000000, max: 20000000, currency: 'IDR' }, outlookGrowth: 10 }
          ],
          'artistic': [
            { title: 'Graphic Designer', match: scores.artistic, description: 'Create visual designs', categories: ['artistic'], educationRequired: 'Bachelor\'s Degree', salary: { min: 6000000, max: 12000000, currency: 'IDR' }, outlookGrowth: 6 }
          ],
          'social': [
            { title: 'Teacher', match: scores.social, description: 'Educate and guide students', categories: ['social'], educationRequired: 'Bachelor\'s Degree', salary: { min: 4000000, max: 8000000, currency: 'IDR' }, outlookGrowth: 7 }
          ],
          'enterprising': [
            { title: 'Business Manager', match: scores.enterprising, description: 'Lead and manage business operations', categories: ['enterprising'], educationRequired: 'Bachelor\'s Degree', salary: { min: 8000000, max: 20000000, currency: 'IDR' }, outlookGrowth: 12 }
          ],
          'conventional': [
            { title: 'Accountant', match: scores.conventional, description: 'Manage financial records', categories: ['conventional'], educationRequired: 'Bachelor\'s Degree', salary: { min: 6000000, max: 12000000, currency: 'IDR' }, outlookGrowth: 6 }
          ]
        };

        let recommendations = [];
        topCategories.forEach(category => {
          if (careerDatabase[category]) {
            recommendations.push(...careerDatabase[category]);
          }
        });

        return recommendations
          .sort((a, b) => b.match - a.match)
          .slice(0, 5);
      };

      const careerRecommendations = generateBasicCareerRecommendations(sortedCategories, riasecScores);

      // Create complete RiasecResult object
      const riasecResult = {
        realistic: riasecScores.realistic || 0,
        investigative: riasecScores.investigative || 0,
        artistic: riasecScores.artistic || 0,
        social: riasecScores.social || 0,
        enterprising: riasecScores.enterprising || 0,
        conventional: riasecScores.conventional || 0,
        timestamp: backendAssessment.date || backendAssessment.createdAt || new Date().toISOString(),
        topCategories: sortedCategories,
        recommendedCareers: careerRecommendations
      };

      return {
        ...baseAssessment,
        type: 'riasec',
        result: riasecResult,
        userId: backendAssessment.studentId,
        userName: backendAssessment.studentName
      };
    }
  }

  return baseAssessment;
};

// Test the transformation
console.log('🧪 Testing transformation logic...');
console.log('📥 Input (Backend Data):');
console.log(JSON.stringify(sampleBackendData, null, 2));

const transformed = transformAssessment(sampleBackendData);
console.log('\n📤 Output (Transformed Assessment):');
console.log(JSON.stringify(transformed, null, 2));

console.log('\n✅ Has result property:', 'result' in transformed);
console.log('✅ Result type:', typeof transformed.result);
console.log('✅ Top categories:', transformed.result?.topCategories);
console.log('✅ Career recommendations count:', transformed.result?.recommendedCareers?.length);

console.log('\n🎯 Test Summary:');
console.log('- Has result property:', 'result' in transformed ? '✅' : '❌');
console.log('- Result is complete RiasecResult:', transformed.result?.topCategories ? '✅' : '❌');
console.log('- Has career recommendations:', transformed.result?.recommendedCareers?.length > 0 ? '✅' : '❌');
