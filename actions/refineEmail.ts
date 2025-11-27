"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function refineEmail(currentBody: string, instruction: string) {
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
          あなたは優秀なビジネスライティング・アシスタントです。
          以下の「現在のメール本文」を、ユーザーの「修正指示」に従って書き直してください。

          ## 現在のメール本文
          "${currentBody}"

          ## 修正指示
          "${instruction}"

          ## ルール
          - 指示内容を的確に反映させてください。
          - ビジネスメールとして自然な表現にしてください。
          - 署名は含めないでください（本文のみ）。
          - JSON形式で出力してください。

          ## 出力フォーマット (JSON)
          {
            "body": "書き直した本文"
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Refine Response:", text);

        return JSON.parse(text);
    } catch (error: any) {
        console.error("Error refining email:", error);
        throw new Error(`修正エラー: ${error.message}`);
    }
}
