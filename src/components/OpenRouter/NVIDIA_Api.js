// OpenRouter/NVIDIA_API.js

const API_KEY = "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";
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
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
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
  // No need to push user message here as it's now handled in the component
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationHistory.concat([{ role: "user", content: messageContent }]),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantReply = data.choices?.[0]?.message?.content;
    
    if (!assistantReply) {
      throw new Error("No response content from assistant");
    }
    
    console.log("Assistant:", assistantReply);
    return assistantReply;
  } catch (err) {
    console.error("Error sending/storing message:", err);
    throw err; // Re-throw for the component to handle
  }
}

/**
 * Save conversation to database (to be implemented with your SQL backend)
 * 
 * @param {Array} conversationHistory - The conversation to save
 * @param {string} userId - Optional user ID to associate with the conversation
 * @returns {Promise<Object>} - Result of the save operation
 */
export async function saveConversationToDatabase(conversationHistory, userId = null) {
  // This is a placeholder for your SQL implementation
  // You would typically send this to your backend API
  
  try {
    // Mock implementation - replace with actual API call
    console.log("Saving conversation to database:", {
      userId,
      timestamp: new Date().toISOString(),
      conversation: conversationHistory
    });
    
    // Mock successful response
    return {
      success: true,
      conversationId: "mock-id-" + Date.now(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error saving to database:", error);
    throw error;
  }
}

export default {
  initialize_nvidia_api,
  sendAndStoreMessage,
  saveConversationToDatabase
};