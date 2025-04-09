import React, { useState, useRef, useEffect } from "react";
import Nav from "./Nav";
import { sendAndStoreMessage } from "./OpenRouter/NVIDIA_Api";
import '../styles/aichat.css'; 
const AIChat = () => {
  // State for UI
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem("purchasedPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });

  // Conversation history for context
  const [conversationHistory, setConversationHistory] = useState([
    { role: "system", content: "You are a helpful assistant." }
  ]);

  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save conversation to localStorage when it changes
  useEffect(() => {
    if (conversationHistory.length > 1) { // Only save if there's actual conversation (more than system message)
      localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  // Load conversation history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setConversationHistory(parsedHistory);
      
      // Extract user/assistant messages for UI display
      const chatMessages = parsedHistory
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => ({
          sender: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString() // Use current time as we don't have original timestamps
        }));
      
      setMessages(chatMessages);
    }
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Update UI immediately
    const userMessage = {
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Send to API and get response
      const assistantResponse = await sendAndStoreMessage(
        inputMessage,
        [...conversationHistory] // Pass a copy to avoid reference issues
      );
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: inputMessage },
        { role: "assistant", content: assistantResponse || "Sorry, I couldn't process that request." }
      ]);
      
      // Update UI with assistant response
      if (assistantResponse) {
        const assistantMessage = {
          sender: "assistant",
          content: assistantResponse,
          timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: "assistant",
          content: "Sorry, an error occurred. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation history
  const handleClearChat = () => {
    // Confirm before clearing
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      setConversationHistory([
        { role: "system", content: "You are a helpful assistant." }
      ]);
      localStorage.removeItem("chatHistory");
    }
  };

  // Save conversation to database
  const saveConversationToDatabase = async () => {
    // This is a placeholder - you would implement your SQL saving logic here
    try {
      // Simulating saving to database
      console.log("Saving conversation to database:", conversationHistory);
      alert("Conversation saved successfully!");
      
      // In a real implementation, you would:
      // 1. Format the data appropriately 
      // 2. Send it to your backend API
      // 3. Handle the response
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Failed to save conversation. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      
      <div className="chat-container">
        <div className="chat-header">
          <h1>AI Chat Assistant</h1>
          <div className="chat-actions">
            <button 
              onClick={handleClearChat}
              className="btn btn-clear"
            >
              Clear Chat
            </button>
            <button 
              onClick={saveConversationToDatabase}
              className="btn btn-save"
            >
              Save to Database
            </button>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>Send a message to start chatting with the AI assistant.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === "user" ? "user-message" : "assistant-message"}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant-message loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message here..."
            disabled={isLoading}
            rows={3}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="send-button"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
