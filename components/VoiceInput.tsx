"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceInputProps {
    onContextChange: (text: string) => void;
}

export default function VoiceInput({ onContextChange }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "ja-JP";

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setText((prev) => {
                            const newText = prev + (prev ? " " : "") + finalTranscript;
                            onContextChange(newText);
                            return newText;
                        });
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'not-allowed') {
                        setError("マイクの使用が許可されていません。ブラウザの設定を確認してください。");
                    } else if (event.error === 'service-not-allowed') {
                        setError("このブラウザでは音声認識が利用できません。SafariやChromeなど、標準ブラウザでお試しください（アプリ内ブラウザでは動作しない場合があります）。");
                    } else if (event.error === 'no-speech') {
                        // Ignore no-speech error as it just means silence
                        return;
                    } else {
                        setError("音声認識エラーが発生しました: " + event.error);
                    }
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                setError("このブラウザは音声認識をサポートしていません。");
            }
        }
    }, [onContextChange]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setError(null);
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        onContextChange(e.target.value);
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200 mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Mic className="w-5 h-5 text-gray-900" />
                Context
            </h2>

            <div className="mb-4">
                <button
                    onClick={toggleRecording}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${isRecording
                        ? "bg-red-50 text-red-600 border-2 border-red-500 animate-pulse"
                        : "bg-black hover:bg-gray-800 text-white shadow-md"
                        }`}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-6 h-6" />
                            <span className="font-bold">録音停止</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span className="font-bold">録音開始</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="例: 渋谷のカフェで会った。サウナの話で盛り上がった。来週資料を送る必要がある。"
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-transparent resize-none outline-none transition-all"
            />
        </div>
    );
}
