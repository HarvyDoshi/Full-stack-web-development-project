import { NextFunction, Request, Response } from "express";
import User1 from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js"; // Adjust to point to Gemini configuration
import { GoogleGenerativeAI } from "@google/generative-ai"; // Ensure this is the correct import
import { getAllUsers } from "./user-controllers.js";

type ChatCompletionRequestMessage = {
  role: string;
  content: string;
};

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User1.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    // Grab chats of user
    const chats: ChatCompletionRequestMessage[] = user.chats.map(
      ({ role, content }) => ({
        role,
        content,
      })
    );

    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    // Send all chats with new one to Gemini API
    const gemini = configureGemini();
    const model = gemini.getGenerativeModel({
      model: "gemini-pro", // Replace with the appropriate model name
    });

    const result = await model.generateContent({
      contents: chats.map((chat) => ({
        role: chat.role,
        parts: [{ text: chat.content }],
      })),
    });

    const response = await result.response;

    if (response?.text.length) {
      const generatedMessage = {
        role: "assistant",
        content: response[0].text,
      };
      user.chats.push(generatedMessage);
      await user.save();
    } else {
      return res
        .status(500)
        .json({ message: "Failed to fetch response from Gemini API" });
    }

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User1.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User1.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    // Clear the user's chats
    user.chats.remove;
    await user.save();

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
