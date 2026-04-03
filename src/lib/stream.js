import {StreamChat } from 'stream-chat';
import { StreamClient } from "@stream-io/node-sdk";
import { ENV } from './env.js';

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY and STREAM_API_SECRET is missing.");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret); //for Chats
export const streamClient = new StreamClient(apiKey, apiSecret); //for vC

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log("Stream User upserted successfully:", userData);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
};

export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log("Stream User deleted successfully:", userId);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
};