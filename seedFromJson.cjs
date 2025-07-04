// Usage: node seedFromJson.cjs
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function toEnum(val, allowed) {
  if (!val) return allowed[0];
  const up = val.toUpperCase().replace(/[- ]/g, '_');
  return allowed.includes(up) ? up : allowed[0];
}

function toISO(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d) ? undefined : d.toISOString();
}

function makeJobId(title, num) {
  return title.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '') + '-' + num;
}

function makeCandidateId(name, num) {
  return name.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, '') + '-' + num;
}

async function main() {
  const dataPath = path.join(__dirname, 'data.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  // Create a default HR user
  let hrUser;
  try {
    hrUser = await prisma.user.upsert({
      where: { email: 'hr@company.com' },
      update: {},
      create: {
        email: 'hr@company.com',
        name: 'HR User',
        role: 'HR',
        username: 'hruser',
      },
    });
  } catch (e) {
    console.error('Error creating HR user:', e);
    process.exit(1);
  }

  // Map mock job id (int) to custom string job id
  const jobIdMap = {};

  // Allowed enums
  const jobStatusEnum = ['ACTIVE', 'INACTIVE', 'CLOSED', 'DRAFT'];
  const candidateStatusEnum = ['ACTIVE', 'REJECTED', 'HIRED', 'WITHDRAWN'];
  const hiringStageEnum = ['OMOED', 'SCREENING', 'TECHNICAL_TEST', 'FINAL_INTERVIEW', 'HIRED', 'REJECTED'];

  // Insert jobs
  let jobNum = 1;
  for (const job of data.jobs) {
    const { candidates, id: mockJobId, applicants, latestUpdate, creationDate, requirements, responsibilities, ...jobFields } = job;
    const visibleRequirements = Array.isArray(requirements) ? requirements : [];
    const invisibleRequirements = [];
    const resp = Array.isArray(responsibilities) ? responsibilities : [];
    const applicantCount = typeof applicants === 'number' ? applicants : 0;
    const deadline = toISO(job.deadline);
    const latestUpdateISO = toISO(latestUpdate);
    const creationDateISO = toISO(creationDate);
    const customJobId = makeJobId(job.title, jobNum);
    let createdJob;
    try {
      createdJob = await prisma.job.create({
        data: {
          id: customJobId,
          title: job.title,
          department: job.department,
          status: toEnum(job.status, jobStatusEnum),
          level: job.level,
          experience: job.experience,
          employmentType: job.employmentType,
          workType: job.workType,
          salary: job.salary || null,
          location: job.location,
          deadline: deadline ? new Date(deadline) : null,
          description: job.description,
          visibleRequirements,
          invisibleRequirements,
          responsibilities: resp,
          applicantCount,
          latestUpdate: latestUpdateISO ? new Date(latestUpdateISO) : undefined,
          createdAt: creationDateISO ? new Date(creationDateISO) : undefined,
        },
      });
      jobIdMap[mockJobId] = customJobId;
    } catch (e) {
      console.error('Error creating job:', job.title, e);
      continue;
    }
    jobNum++;
  }

  // Insert candidates and candidate-job relations
  let candidateNum = 1;
  for (const job of data.jobs) {
    const { candidates, id: mockJobId } = job;
    if (!Array.isArray(candidates)) continue;
    for (const candidate of candidates) {
      // Build personalInfo
      let personalInfo = candidate.personalInfo || {
        email: candidate.email,
        phone: candidate.phone,
        country: candidate.country,
      };
      // Build socialLinks
      let socialLinks = candidate.socialLinks || null;
      // Map enums
      const currentStage = toEnum(candidate.stage, hiringStageEnum);
      const status = toEnum(candidate.status, candidateStatusEnum);
      // Dates
      const appliedAt = toISO(candidate.appliedDate);
      // Arrays
      const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
      const languages = Array.isArray(candidate.languages) ? candidate.languages : [];
      const interests = Array.isArray(candidate.interests) ? candidate.interests : [];
      const attachments = Array.isArray(candidate.attachments) ? candidate.attachments : [];
      // Score
      const totalScore = typeof candidate.score === 'number' ? candidate.score : 0;
      // Custom candidate ID
      const customCandidateId = makeCandidateId(candidate.name, candidateNum);
      // Insert candidate
      let createdCandidate;
      try {
        createdCandidate = await prisma.candidate.create({
          data: {
            id: customCandidateId,
            hrUserId: hrUser.id,
            name: candidate.name,
            note: candidate.note || null,
            avatarUrl: candidate.avatarUrl || null,
            personalInfo,
            socialLinks,
            overview: candidate.overview || null,
            resumeUrl: candidate.resumeUrl || null,
            skills,
            languages,
            interests,
            attachments,
            currentStage,
            status,
            totalScore,
            appliedAt: appliedAt ? new Date(appliedAt) : undefined,
          },
        });
      } catch (e) {
        console.error('Error creating candidate:', candidate.name, e);
        continue;
      }
      // Insert candidate-job join
      try {
        await prisma.candidateJob.create({
          data: {
            candidateId: customCandidateId,
            jobId: jobIdMap[mockJobId],
            appliedAt: appliedAt ? new Date(appliedAt) : undefined,
          },
        });
      } catch (e) {
        console.error('Error creating candidate-job for:', candidate.name, e);
      }
      candidateNum++;
    }
  }
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 