const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSmartReplies = async (req, res) => {
  const { conversation, userPrompt, summarize } = req.body;
  console.log("User Prompt:", userPrompt);
  console.log("Summarize:", summarize);

  if (!conversation || conversation.length === 0) {
    return res.status(400).json({ error: "No conversation provided" });
  }

  try {
    // Prepare the OpenAI API call, including the userPrompt
    const messages = conversation.map((msg, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: msg,
    }));

    // Check if user wants a summary
    if (summarize) {
      const last50Messages = conversation.slice(-50).join('\n');
      messages.push({
        role: 'system',
        content: `Summarize the following conversation: ${last50Messages}. Provide a concise summary of the key points but don't be too formal.`
      });
    }

    // Include userPrompt in the request if provided
    if (userPrompt) {
      messages.push({
        role: 'system',  // Add the user's instruction to the system
        content: `You are an AI that helps users reply to messages based on the context of the conversation. Generate replies based on this conversation given. The user wants the response to be: ${userPrompt}. Don't output any unnecessary dialog, only output the reponse the user can give without quotations`,
      });
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: summarize ? 150 : 100,
      n: summarize ? 1 : 3,
    });

    // If summarizing, return the summary separately
    if (summarize) {
      const summary = response.choices[0].message.content.trim();
      return res.json({ summary });
    }
    
    // Otherwise, return the smart reply suggestions
    const suggestions = response.choices.map(choice => choice.message.content.trim());
    res.json({ suggestions });
    
  } catch (error) {
    console.error("Error generating smart replies or summary:", error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: "You have exceeded your API quota. Please upgrade your plan or check billing details."
      });
    }

    return res.status(500).json({ error: "Failed to generate smart replies or summary" });
  }
};
  
module.exports = { generateSmartReplies };
