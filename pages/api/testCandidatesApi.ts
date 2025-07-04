const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/candidates';

async function testGetCandidates() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log('GET /api/candidates response:', data);
  } catch (err) {
    console.error('GET /api/candidates error:', err);
  }
}

async function testPostCandidate() {
  try {
    const body = {
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
      hrUserId: 'test-hr-user-id'
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('POST /api/candidates response:', data);
  } catch (err) {
    console.error('POST /api/candidates error:', err);
  }
}

(async () => {
  await testPostCandidate();
  await testGetCandidates();
})(); 