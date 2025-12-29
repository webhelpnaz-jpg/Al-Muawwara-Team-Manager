import { GoogleGenAI } from "@google/genai";
import { DashboardStats, Team } from "../types";

const API_KEY = process.env.API_KEY || ''; 

// Initialize only if key exists (mock safety)
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateAttendanceInsights = async (stats: DashboardStats, topTeams: Team[]): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API Key is missing. Please configure the environment variable to receive AI insights.";
  }

  try {
    const prompt = `
      Analyze the following school sports statistics for Al Munawwara School Teams:
      - Total Players: ${stats.totalPlayers}
      - Active Teams: ${stats.activeTeams}
      - Today's Attendance Check-ins: ${stats.attendanceToday}
      - Upcoming Events: ${stats.upcomingEvents}
      - Top Performing Teams (Activity): ${topTeams.map(t => t.name).join(', ')}

      Provide a 3-sentence executive summary for the Principal highlighting participation trends and one suggestion for improvement. Keep it professional and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights due to a network or configuration error.";
  }
};