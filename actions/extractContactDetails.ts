"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractContactDetails(imageBase64: string) {
    try {
        const apiKey = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            throw new Error("APIキーが設定されていません。");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            名刺画像から以下の情報を抽出してください。
            JSON形式で出力してください。
            
            {
                "name": "氏名 (例: 山田 太郎)",
                "company": "会社名 (例: 株式会社サンプル)",
                "email": "メールアドレス"
            }
            
            読み取れない場合は空文字にしてください。
        `;

        const base64Data = imageBase64.split(",")[1];
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("Extraction Response:", text);

        return JSON.parse(text);
    } catch (error: any) {
        console.error("Error extracting details:", error);
        // Return empty details on error to allow manual entry
        return { name: "", company: "", email: "" };
    }
}
