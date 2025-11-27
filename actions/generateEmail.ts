"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Removed global apiKey and genAI as they are now defined within the function

export async function generateEmail(
    imageBase64: string | null,
    context: string,
    manualDetails?: { name: string; company: string; email: string },
    platform: "email" | "linkedin" | "slack" = "email",
    tone: "3" | "2" | "1" = "2"
) {
    try {
        const apiKey = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();
        if (!apiKey) {
            throw new Error("APIキーが設定されていません。.env.localを確認してください。");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        let prompt = `
          あなたは、あらゆるビジネスシーンに対応できる優秀な「ビジネスライティング・アシスタント」です。
          ユーザーから提供される情報に基づき、最適なビジネス文書やメッセージを作成してください。

          ## 入力される情報
          1. **プラットフォーム**: ${platform}
          2. **トーン（丁寧さのレベル）**: レベル${tone}
          3. **伝えたい要点 (コンテキスト)**: "${context}"

          ## トーンの定義とルール
          出力する文体は、指定されたレベルに従って厳密に制御してください。

          ### 【レベル3：超丁寧】（格式高い）
          - **対象**: 取引先、役員、目上の方、謝罪時、初対面の相手。
          - **特徴**: 正しい尊敬語・謙譲語・丁重語を駆使する。「恐れ入りますが」「幸いです」「拝啓/敬具」など、クッション言葉や定型的な挨拶を適切に含める。
          - **雰囲気**: 厳格、誠実、礼儀正しい。

          ### 【レベル2：丁寧】（標準ビジネス）
          - **対象**: 直属の上司、先輩、他部署の人、一般的な社外連絡。
          - **特徴**: 基本的な「です・ます」調。過剰な敬語は避け、わかりやすさと礼儀正しさのバランスを取る。
          - **雰囲気**: 清潔感、プロフェッショナル、円滑。

          ### 【レベル1：フランク】（親しみ）
          - **対象**: 同期、親しいチームメンバー、部下、SNSでのカジュアルな発信。
          - **特徴**: 柔らかい「です・ます」調、あるいはTPOに応じて適度な砕けた表現（「〜ですよね」「〜しましょう！」）。絵文字の使用もプラットフォームによっては許可される。
          - **雰囲気**: 親近感、前向き、スピーディー。

          ## プラットフォーム別フォーマット規定

          ### A. メール (Email) の場合
          - **件名**: 具体的で分かりやすい件名を作成する。
          - **構成**: 挨拶 → 本文 → 結びの言葉。

          ### B. LinkedIn / SNS の場合
          - **件名**: 不要。代わりに「フックとなる1行目」を件名フィールドに出力する。
          - **構成**: 読み手の関心を引く導入 → 本文（改行を多用して可読性を高める） → Call to Action。
          - **装飾**: トーンに合わせて適切なハッシュタグ（#）や、絵文字（レベル1・2の場合）を使用。

          ### C. チャットツール (Slack/Teams) の場合
          - **件名**: 不要。代わりに「要約」または「空文字」を件名フィールドに出力する。
          - **構成**: 「お疲れ様です」などの短い挨拶から入り、要件を簡潔に伝える。冗長な前置きは省略する。

          ## 出力フォーマット (JSON)
          必ず以下のJSON形式のみを出力してください。
          {
            "email": "抽出したメールアドレス (見つからない場合は空文字)",
            "name": "抽出した相手の名前 (例: 山田 太郎 様)",
            "subject": "生成した件名 (LinkedIn/Slackの場合はフックや要約)",
            "body": "生成した本文 (署名は含めない)"
          }
        `;

        const finalParts: any[] = [prompt]; // Start with the main prompt

        if (imageBase64) {
            const base64Data = imageBase64.split(",")[1];
            finalParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            });
            // Add instruction for image processing to the prompt
            finalParts[0] += `\n\n**名刺画像情報**: 提供された名刺画像から、相手の名前、会社名、メールアドレスを正確に読み取ってください。`;
        } else if (manualDetails) {
            // Add manual details to the prompt
            finalParts[0] += `\n\n**相手の情報 (手動入力)**:
              - 名前: ${manualDetails.name}
              - 会社名: ${manualDetails.company}
              - メールアドレス: ${manualDetails.email}`;
        } else {
            throw new Error("名刺画像または手動入力情報のいずれかが必要です。");
        }

        // Final instruction to the model
        finalParts[0] += `\n\n上記の指示に従い、JSONのみを出力してください。`;

        const finalResult = await model.generateContent(finalParts);
        const response = await finalResult.response;
        const text = response.text();
        console.log("Gemini Response:", text);

        return JSON.parse(text);
    } catch (error: any) {
        console.error("Error generating email:", error);
        throw new Error(`生成エラー: ${error.message}`);
    }
}

