import { GoogleGenAI } from "@google/genai";
import { DailyKPI } from '../types';

export const generateNetworkInsight = async (data: DailyKPI[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment variable.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a summary of the data for the prompt
  const latest = data[data.length - 1];
  const summary = `
    Latest Date: ${latest.date}
    Throughput DL: ${latest.throughputDL} Mbps
    PRB Utilization: ${latest.prbUtilization}%
    Drop Rate: ${latest.dropRate}%
    RSRP: ${latest.rsrp} dBm
  `;

  const prompt = `
    You are a Senior Telecommunications Network Engineer. 
    Analyze the following KPI snapshot from a CEM (Customer Experience Management) dashboard:
    ${summary}
    
    Provide a concise, 3-sentence executive summary of the network health. 
    Focus on User Experience (QoE) and Radio conditions. 
    Suggest one immediate action if any KPI looks degraded (e.g., Drop Rate > 0.5%, PRB > 80%).
    If all good, mention stability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please check connectivity or quota.";
  }
};