import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { status, stage, jobId } = req.query;

    const where: any = {};
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
  }

  if (req.method === 'POST') {
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
          create: (jobIds as string[]).map((jobId: string) => ({ jobId }))
        },
        workExperience: {
          create: resumeData.workingExperience
        },
        education: {
          create: resumeData.education
        },
        certifications: {
          create: resumeData.certifications
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
  }
} 