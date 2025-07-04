const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/candidates';

async function testGetCandidates() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log('GET /api/candidates response:', data);
  } catch (error) {
    console.error('GET /api/candidates error:', error);
  }
}

async function testPostCandidate() {
  try {
    const response = await fetch('http://localhost:3000/api/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: {
          name: 'Test Candidate',
          personalInfo: { gender: 'Other', dob: '2000-01-01', email: 'test@example.com', phone: '1234567890', address: '123 Test St' },
          socialLinks: { linkedin: 'https://linkedin.com/in/test', github: 'https://github.com/test', twitter: 'https://twitter.com/test' },
          overview: 'A test candidate for API verification.',
          skills: ['JavaScript', 'React'],
          languages: [{ name: 'English', proficiency: 'Fluent' }],
          interests: ['Coding', 'Testing'],
          attachments: [],
          workingExperience: [],
          education: [],
          certifications: [],
          awards: [],
          projects: []
        },
        jobIds: [],
        hrUserId: 'real-existing-user-id'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    // Only parse as JSON if it's actually JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = JSON.parse(text);
      console.log('POST /api/candidates response:', data);
    } else {
      console.log('Response is not JSON, got:', text.substring(0, 100));
    }
  } catch (error) {
    console.error('POST /api/candidates error:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Testing POST /api/candidates...');
  await testPostCandidate();
  
  console.log('\nTesting GET /api/candidates...');
  await testGetCandidates();
}

runTests(); 