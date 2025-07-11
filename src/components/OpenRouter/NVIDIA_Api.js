/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

// Use environment variables in production - not hardcoded
const API_KEY =
  "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";
const MODEL = "nvidia/llama-3.1-nemotron-nano-8b-v1:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Initialize NVIDIA API and test connection
 */
export async function initialize_nvidia_api() {
  console.log("Initializing NVIDIA API...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: "Hello, are you online?",
          },
        ],
      }),
    });
    console.log(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    console.log("API connection successful:", data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("Error initializing NVIDIA API:", error);
    return false;
  }
}

/**
 * Send a message to the NVIDIA API and update conversation history
 *
 * @param {string} messageContent - The user's message
 * @param {Array} conversationHistory - The current conversation history
 * @returns {Promise<string|null>} - The assistant's response or null if error
 */
export async function sendAndStoreMessage(messageContent, conversationHistory) {
  try {
    // Validate input
    if (!messageContent || !messageContent.trim()) {
      throw new Error("Message content cannot be empty");
    }

    if (!Array.isArray(conversationHistory)) {
      console.warn(
        "conversationHistory is not an array, initializing empty array"
      );
      conversationHistory = [];
    }

    const messages = [
      ...conversationHistory,
      { role: "user", content: messageContent },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        // Remove response_format to avoid compatibility issues
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    const assistantReply = data.choices[0].message.content;

    console.log("Assistant:", assistantReply);
    return assistantReply;
  } catch (err) {
    console.error("Error sending/storing message:", err);
    throw err; // Re-throw for the component to handle
  }
}

/**
 * Generate AI insights for the Dashboard based on user data
 *
 * @param {Object} userData - User data including workout history, weight, etc.
 * @returns {Promise<Array<string>>} - Array of AI insights
 */
export async function generateDashboardInsights(userData) {
  delete userData?.personalInfo.profileImage; // Remove personal info for privacy
  try {
    const prompt = `
      As a fitness AI assistant, analyze this user's fitness data and provide 3-4 personalized, actionable insights. 
      Each insight should be a single, concise sentence. Focus on patterns, improvements, and suggestions.
      
      User Data:
      ${JSON.stringify(userData || {})}
      
      Format your response as a JSON array of strings, with each string being one insight.
      Example: ["You're most consistent with workouts on Mondays and Wednesdays.", "Your cardio performance has improved 15% over the last month."]
    `;
    console.log("prompt", prompt);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        // Remove response_format to avoid compatibility issues
      }),
    });
    console.log("response", response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON, but with fallback handling
    try {
      // First, try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
      }

      const parsedResponse = JSON.parse(jsonText);
      return Array.isArray(parsedResponse)
        ? parsedResponse
        : (parsedResponse.insights || Object.values(parsedResponse)).filter(
            (item) => typeof item === "string"
          );
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // If parsing fails, try to extract insights from the text
      const insights = aiResponse
        .split(/\d+\.|\n\s*\*/)
        .filter((line) => line.trim().length > 0)
        .map((line) => line.trim())
        .slice(0, 4);
      return insights.length > 0
        ? insights
        : [
            "Focus on increasing protein intake to support your muscle recovery.",
            "Try adding one more strength training session per week to accelerate progress.",
            "Your consistency on weekdays is excellent, consider adding light activity on weekends.",
          ];
    }
  } catch (err) {
    console.error("Error generating dashboard insights:", err);
    return [
      "Focus on increasing protein intake to support your muscle recovery.",
      "Try adding one more strength training session per week to accelerate progress.",
      "Your consistency on weekdays is excellent, consider adding light activity on weekends.",
    ]; // Fallback insights
  }
}

/**
 * Generate AI fitness insights for the Analytics Dashboard
 *
 * @param {Object} analyticsData - User's analytics data including workout history, body metrics, etc.
 * @returns {Promise<Object>} - Object containing various fitness insights
 */
export async function generateFitnessInsights(analyticsData) {
  try {
    const prompt = `
      As a fitness AI assistant, analyze this user's fitness analytics data and provide detailed insights in three categories:
      1. Performance Patterns - When and how the user performs best
      2. Recovery Analysis - The user's recovery needs and patterns
      3. Nutrition Impact - How nutrition affects the user's performance
      
      Analytics Data:
      ${JSON.stringify(analyticsData || {})}
      
      Strictly Format your response as a JSON object with three keys: performancePatterns, recoveryAnalysis, and nutritionImpact.
      Each value should be a detailed paragraph (2-3 sentences). ( For eg : {performancePatterns: ..., recoveryAnalysis: ..., nutritionImpact: ...} )
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        // Remove response_format to avoid compatibility issues
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON, but with fallback handling
    try {
      // First, try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return fallback insights
      return {
        performancePatterns:
          "Your workouts are most effective on weekday mornings. Schedule high-intensity sessions between 7-9am for optimal results.",
        recoveryAnalysis:
          "You're showing signs of needing additional recovery time. Consider adding an extra rest day this week.",
        nutritionImpact:
          "Your performance drops on days with less than 100g of protein intake. Consider increasing protein consumption.",
      };
    }
  } catch (err) {
    console.error("Error generating fitness insights:", err);
    return {
      performancePatterns:
        "Your workouts are most effective on weekday mornings. Schedule high-intensity sessions between 7-9am for optimal results.",
      recoveryAnalysis:
        "You're showing signs of needing additional recovery time. Consider adding an extra rest day this week.",
      nutritionImpact:
        "Your performance drops on days with less than 100g of protein intake. Consider increasing protein consumption.",
    }; // Fallback insights
  }
}

/**
 * Generate exercise recommendations based on user data and preferences
 *
 * @param {Object} userData - User's fitness data including workout history, preferences, etc.
 * @param {string} bodyPartFilter - Optional filter for specific body part
 * @returns {Promise<Array<Object>>} - Array of exercise recommendations
 */
export async function generateExerciseRecommendations(
  userData,
  bodyPartFilter = "All"
) {
  try {
    const prompt = `
      As a fitness AI assistant, provide personalized exercise recommendations for this user based on their data and preferences.
      Focus on exercises that will help them achieve their goals and complement their current routine.
      
      User Data:
      ${JSON.stringify(userData || {})}
      
      Body Part Filter: ${bodyPartFilter}
      
      Strictly Format your response as a JSON array of exercise objects. Each exercise object should include:
      - title: Name of the exercise
      - bodyPart: Primary body part targeted
      - type: Type of exercise (strength, cardio, flexibility, etc.)
      - level: Difficulty level (beginner, intermediate, advanced)
      - description: Brief description of the exercise and its benefits
      - youtube_video: A URL to a tutorial video (can be a placeholder or omitted)

      example response : 
      {
        title: "Push Up",
        bodyPart: "Chest",
        type: "Strength",
        level: "Beginner",
        description: "A basic bodyweight exercise that targets the chest, shoulders, and triceps.",
        youtube_video: "https://www.youtube.com/watch?v=IODxDxX7oi4"
      }
      
      Provide 5 exercise recommendations that match the user's level and goals.
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        // Remove response_format to avoid compatibility issues
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from API");
    }

    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON, but with fallback handling
    try {
      // First, try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      console.log("jsonMatch", jsonMatch);
      console.log("jsonText", jsonText);  
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
      }

      const parsedResponse = JSON.parse(jsonText);
      return Array.isArray(parsedResponse)
        ? parsedResponse
        : parsedResponse.exercises ||
            parsedResponse.recommendations ||
            Object.values(parsedResponse).filter(Array.isArray)[0] ||
            [];
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return fallback recommendations
      return [
        {
          title: "Bulgarian Split Squats",
          bodyPart: "Legs",
          type: "Strength",
          level: "Intermediate",
          description:
            "Great unilateral exercise for developing leg strength and balance. Targets quads, glutes, and hamstrings effectively.",
          youtube_video: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
        },
        {
          title: "Incline Dumbbell Press",
          bodyPart: "Chest",
          type: "Strength",
          level: "Intermediate",
          description:
            "Targets the upper chest muscles more effectively than flat bench press. Good for developing chest definition.",
          youtube_video: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
        },
        {
          title: "Kettlebell Swings",
          bodyPart: "Full Body",
          type: "Cardio/Strength",
          level: "Beginner",
          description:
            "Excellent exercise for cardiovascular fitness and posterior chain development. Burns calories while building strength.",
          youtube_video: "https://www.youtube.com/watch?v=YSxHifyI6s8",
        },
      ];
    }
  } catch (err) {
    console.error("Error generating exercise recommendations:", err);
    return [
      {
        title: "Bulgarian Split Squats",
        bodyPart: "Legs",
        type: "Strength",
        level: "Intermediate",
        description:
          "Great unilateral exercise for developing leg strength and balance. Targets quads, glutes, and hamstrings effectively.",
        youtube_video: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
      },
      {
        title: "Incline Dumbbell Press",
        bodyPart: "Chest",
        type: "Strength",
        level: "Intermediate",
        description:
          "Targets the upper chest muscles more effectively than flat bench press. Good for developing chest definition.",
        youtube_video: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
      },
      {
        title: "Kettlebell Swings",
        bodyPart: "Full Body",
        type: "Cardio/Strength",
        level: "Beginner",
        description:
          "Excellent exercise for cardiovascular fitness and posterior chain development. Burns calories while building strength.",
        youtube_video: "https://www.youtube.com/watch?v=YSxHifyI6s8",
      },
    ]; // Fallback recommendations
  }
}

/**
 * Save conversation to database (to be implemented with your SQL backend)
 *
 * @param {Array} conversationHistory - The conversation to save
 * @param {string} userId - Optional user ID to associate with the conversation
 * @returns {Promise<Object>} - Result of the save operation
 */
export async function saveConversationToDatabase(
  conversationHistory,
  userId = null
) {
  // This is a placeholder for your SQL implementation
  // You would typically send this to your backend API

  try {
    // Validate inputs
    if (!Array.isArray(conversationHistory)) {
      throw new Error("conversationHistory must be an array");
    }

    // Mock implementation - replace with actual API call
    console.log("Saving conversation to database:", {
      userId,
      timestamp: new Date().toISOString(),
      conversation: conversationHistory,
    });

    // Mock successful response
    return {
      success: true,
      conversationId: "mock-id-" + Date.now(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error saving to database:", error);
    throw error;
  }
}

export default {
  initialize_nvidia_api,
  sendAndStoreMessage,
  saveConversationToDatabase,
  generateDashboardInsights,
  generateFitnessInsights,
  generateExerciseRecommendations,
};