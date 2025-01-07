import { NextFunction, Request, Response } from "express";
import User1 from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js";

type ChatCompletionRequestMessage = {
  role: string;
  content: string;
};

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  try {
    const user = await User1.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    const chats: ChatCompletionRequestMessage[] = user.chats.map(({ role, content }) => ({
      role,
      content,
    }));
    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    const gemini = configureGemini();
    if (!gemini) {
      console.warn("Gemini API is not configured. Returning a mock response.");
      const mockResponse = { role: "assistant", content: "This is a mock response from Gemini." };
      user.chats.push(mockResponse);
      await user.save();
      return res.status(200).json({ chats: user.chats });
    }

    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash-8b"});
    const result = await model.generateContent({
      contents: chats.map((chat) => ({
        role: chat.role,
        parts: [{ text: chat.content }],
      })),
    });

    const response = await result.response;
    if (response?.text.length) {
      const generatedMessage = { role: "assistant", content: response[0].text };
      user.chats.push(generatedMessage);
      await user.save();
      return res.status(200).json({ chats: user.chats });
    } else {
      return res.status(500).json({ message: "Failed to fetch response from Gemini API" });
    }
  } catch (error: any) {
    console.error("Error in generating chat completion:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

export const sendChatsToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User1.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).json({ message: "Permissions didn't match" });
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({ message: "Error fetching chats", cause: error.message });
  }
};

export const deleteChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User1.findById(res.locals.jwtData.id);
      if (!user) {
        return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
      }
  
      if (user._id.toString() !== res.locals.jwtData.id) {
        return res.status(401).json({ message: "Permissions didn't match" });
      }
  
      // Clear the chats array
      user.chats.splice(0, user.chats.length); // Remove all elements from the DocumentArray
      await user.save();
  
      return res.status(200).json({ message: "OK, chats cleared" });
    } catch (error) {
      console.error("Error deleting chats:", error);
      return res.status(500).json({ message: "Error deleting chats", cause: error.message });
    }
  };
  
