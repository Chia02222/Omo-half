import { GoogleGenAI } from "@google/genai";
import { Candidate, SmarsEvaluation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function formatCandidateData(candidates: Candidate[]): string {
    let context = "Here is the current list of candidates and their evaluations for this job:\n\n";
    
    const candidatesByStage: { [key: string]: Candidate[] } = {};
    candidates.forEach(candidate => {
        if (!candidatesByStage[candidate.stage]) {
            candidatesByStage[candidate.stage] = [];
        }
        candidatesByStage[candidate.stage].push(candidate);
    });

    for (const stage in candidatesByStage) {
        context += `Stage: ${stage}\n`;
        candidatesByStage[stage].forEach(candidate => {
            context += `  - Candidate: ${candidate.name}\n`;
            context += `    - Score: ${candidate.score}\n`;
            context += `    - Positive points:\n`;
            candidate.points.filter(p => p.status === 'positive').forEach(p => {
                context += `      - ${p.text}\n`;
            });
            context += `    - Neutral points:\n`;
            candidate.points.filter(p => p.status === 'neutral').forEach(p => {
                context += `      - ${p.text}\n`;
            });
            context += `    - Negative points:\n`;
            candidate.points.filter(p => p.status === 'negative').forEach(p => {
                context += `      - ${p.text}\n`;
            });
        });
        context += '\n';
    }
    return context;
}

export async function callGeminiApi(query: string, candidates: Candidate[]): Promise<string> {
  const candidateContext = formatCandidateData(candidates);
  const fullPrompt = `${candidateContext}\n\nBased on the data provided, please answer the following question. Be concise and helpful, like a recruitment assistant.\n\nQuestion: "${query}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: fullPrompt,
       config: {
        systemInstruction: "You are an expert HR assistant. Your role is to analyze candidate data and provide clear, concise comparisons or summaries to help a hiring manager make decisions. Do not invent any information. Base your answers strictly on the provided data.",
      },
    });

    return response.text ?? '';
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a response from the AI model.");
  }
}

export async function evaluateResumesWithSmars(
  resumeTexts: string[],
  jobTitle: string,
  jobDescription: string
): Promise<SmarsEvaluation[]> {
  const resumeBatchPrompt = resumeTexts
    .map((text, index) => `--- RESUME ${index + 1} ---\n${text}\n--- END RESUME ${index + 1} ---`)
    .join('\n\n');

  const fullPrompt = `
Job Title: ${jobTitle}
Job Description: ${jobDescription}

Resume Batch:
${resumeBatchPrompt}

Please evaluate each resume based on the following agent perspectives:

1.  **HR Representative:**
    -   Assess clarity, professionalism, and communication in the resume.
    -   Verify if the years of experience and previous roles align with the job requirements.
    -   Score from 1 (poor) to 100 (excellent).

2.  **Tech Lead:**
    -   Evaluate the relevance and depth of technical skills, tools, and technologies mentioned.
    -   Analyze project descriptions for complexity and impact.
    -   Score from 1 (poor) to 100 (excellent).

3.  **Culture Fit Expert:**
    -   Look for indicators of teamwork, collaboration, continuous learning (e.g., certifications, courses), and problem-solving approaches.
    -   Score from 1 (poor) to 100 (excellent).

For each resume, generate a JSON object. The final output must be a single JSON array containing these objects. Do not include any text outside the JSON array.

The JSON object for each candidate must have this exact structure:
{
  "name": "string",
  "role": "string",
  "scores": { "hr": number, "tech": number, "culture": number },
  "overallScore": number,
  "points": [ { "text": "string", "status": "positive" | "neutral" | "negative" } ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: fullPrompt,
      config: {
        systemInstruction: "You are a Single-Prompted Multi-turn Multi-Agent Reasoning System (SMARS) for resume evaluation. You simulate three experts: HR, Tech Lead, and Culture Fit Expert. Analyze resumes for a given job and return a JSON array of evaluations. Adhere strictly to the requested JSON format and base your analysis solely on the provided resume texts.",
        responseMimeType: "application/json",
      },
    });
    
    let jsonStr = response.text?.trim() ?? '';
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Sanitize string to remove trailing commas which can cause JSON parsing errors
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
    
    const parsedData = JSON.parse(jsonStr) as SmarsEvaluation[];
    return Array.isArray(parsedData) ? parsedData : [];

  } catch (error) {
    console.error("Gemini SMARS call failed:", error);
    throw new Error("Failed to evaluate resumes with the AI model.");
  }
}

export async function generateJobDetails(jobTitle: string, department: string): Promise<{ description: string; requirements: string[]; responsibilities: string[] }> {
  const prompt = `
Generate job details for the following position:
Job Title: ${jobTitle}
Department: ${department}

Provide a comprehensive job description, a list of key requirements, and a list of main responsibilities.

Return the output as a single JSON object with the following exact structure and no trailing commas:
{
  "description": "string",
  "requirements": ["string", "string", ...],
  "responsibilities": ["string", "string", ...]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert HR copywriter. Your task is to generate professional, clear, and appealing job descriptions, requirements, and responsibilities based on a job title. Respond only with the requested JSON object and ensure it is valid with no trailing commas.",
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text?.trim() ?? '';
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Sanitize string to remove trailing commas which can cause JSON parsing errors
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
    
    const parsedData = JSON.parse(jsonStr);
    return parsedData;

  } catch (error) {
    console.error("Gemini job detail generation failed:", error);
    throw new Error("Failed to generate job details with the AI model.");
  }
}