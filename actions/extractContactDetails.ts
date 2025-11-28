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

        // Check for safety-related errors
        const errorMessage = error.message || "";
        if (
            errorMessage.includes("SAFETY") ||
            errorMessage.includes("blocked") ||
            errorMessage.includes("harmful")
        ) {
            // For extraction, we might want to just return empty or throw. 
            // Since this is "extraction", if it's blocked, we probably can't extract anything.
            // Let's return empty but log it clearly. 
            // Or if the user wants to know WHY it failed, we should probably throw.
            // However, the current UI handles extraction failure by just letting user edit manually.
            // But if it's a safety violation, maybe we should warn them?
            // For now, let's stick to the pattern: return empty for extraction to not block the flow,
            // but if the USER explicitly requested "red error message", maybe they mean for GENERATION.
            // The request said "writing content... sensitive... error". This usually applies to generation.
            // But let's be safe and just return empty here so manual entry is possible.
            return { name: "", company: "", email: "" };
        }

        // Return empty details on error to allow manual entry
        return { name: "", company: "", email: "" };
    }
}
