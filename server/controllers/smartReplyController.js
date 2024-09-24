const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate smart replies using OpenAI API (or mock API)
const generateSmartReplies = async (req, res) => {
    const { conversation, userPrompt } = req.body;
    console.log("User Prompt:", userPrompt);

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({ error: "No conversation provided" });
    }
  
    const useMock = process.env.USE_MOCK_OPENAI === "true";
  
    if (useMock) {
      console.log("Using mock API...");
      const mockSuggestions = [
        "This is a mock reply 1.",
        "This is a mock reply 2.",
        "This is a mock reply 3."
      ];
  
      return res.json({ suggestions: mockSuggestions });
    }
  
    try {
      // Prepare the OpenAI API call, including the userPrompt
      const messages = conversation.map((msg, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: msg,
      }));
  
      // Include userPrompt in the request if provided
      if (userPrompt) {
        messages.push({
          role: 'system',  // Add the user's instruction to the system
          content: `You are an AI that helps users reply to messages based on the context of the conversation. Generate replies based on this conversation given. The user wants the response to be: ${userPrompt}. Don't output any unnecessary dialog, only output the reponse the user can give without quotations`,
        });
      }
  
      // Call the real OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 100,
        n: 3,
      });
  
      const suggestions = response.choices.map(choice => choice.message.content.trim());
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating smart replies:", error);
      
      if (error.code === 'insufficient_quota') {
        return res.status(429).json({
          error: "You have exceeded your API quota. Please upgrade your plan or check billing details."
        });
      }
  
      return res.status(500).json({ error: "Failed to generate smart replies" });
    }
  };
  
module.exports = { generateSmartReplies };
