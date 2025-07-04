const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /api/candidates
app.get('/api/candidates', async (req, res) => {
  const { status, stage, jobId } = req.query;
  const where = {};
  if (status && typeof status === 'string') where.status = status.toUpperCase();
  if (stage && typeof stage === 'string') where.currentStage = stage.toUpperCase();
  if (jobId && typeof jobId === 'string') where.appliedJobs = { some: { jobId } };

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      appliedJobs: { include: { job: true } },
      hiringProgress: true,
      workExperience: true,
      education: true,
      certifications: true,
      scheduledSessions: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  res.json(candidates);
});

// GET /api/jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        candidates: {
          include: {
            candidate: {
              include: {
                appliedJobs: { include: { job: true } },
                hiringProgress: true,
                workExperience: true,
                education: true,
                certifications: true,
                scheduledSessions: true
              }
            }
          }
        }
      }
    });

    // Flatten candidates for each job to match frontend expectations
    const jobsWithCandidates = jobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      level: job.level,
      experience: job.experience,
      employmentType: job.employmentType,
      workType: job.workType,
      salary: job.salary,
      applicantCount: job.applicantCount,
      latestUpdate: job.latestUpdate,
      createdAt: job.createdAt,
      location: job.location,
      deadline: job.deadline,
      description: job.description,
      requirements: job.visibleRequirements,
      responsibilities: job.responsibilities,
      candidates: job.candidates.map(cj => cj.candidate)
    }));

    res.json(jobsWithCandidates);
  } catch (err) {
    console.error('Error in GET /api/jobs:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// POST /api/candidates
app.post('/api/candidates', async (req, res) => {
  console.log('POST /api/candidates called', req.body);
  try {
    const { resumeData, jobIds, hrUserId } = req.body;

    // Mock SMARS analysis for now
    const smarsResult = {
      percentileRank: 'Top 20%',
      feedback: [{ text: 'Strong resume', status: 'positive' }],
      score: 85
    };

    const status = smarsResult.percentileRank === 'Below Top 20%'
      ? 'REJECTED'
      : 'ACTIVE';

    const candidate = await prisma.candidate.create({
      data: {
        hrUserId,
        name: resumeData.name,
        personalInfo: resumeData.personalInfo,
        socialLinks: resumeData.socialLinks,
        overview: resumeData.overview,
        skills: resumeData.skills,
        languages: resumeData.languages,
        interests: resumeData.interests,
        attachments: resumeData.attachments,
        status,
        currentStage: status === 'REJECTED' ? 'REJECTED' : 'OMOED',
        appliedJobs: {
          create: (jobIds || []).map((jobId) => ({ jobId }))
        },
        workExperience: {
          create: resumeData.workingExperience || []
        },
        education: {
          create: resumeData.education || []
        },
        certifications: {
          create: resumeData.certifications || []
        },
        awards: {
          create: resumeData.awards || []
        },
        projects: {
          create: resumeData.projects || []
        },
        hiringProgress: {
          create: {
            stage: 'OMOED',
            status: 'COMPLETE',
            percentileRanking: smarsResult.percentileRank,
            feedback: smarsResult.feedback,
            nextStage: status === 'ACTIVE'
          }
        }
      },
      include: {
        appliedJobs: { include: { job: true } },
        hiringProgress: true
      }
    });

    res.json(candidate);
  } catch (err) {
    console.error('Error in POST /api/candidates:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Global error handler for uncaught errors
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Unknown error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
}); 