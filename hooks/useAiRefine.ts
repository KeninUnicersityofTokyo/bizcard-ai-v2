"use client";

import { useState, useRef, useEffect } from "react";
import { refineEmail } from "@/actions/refineEmail";

export function useAiRefine(currentBody: string, onUpdate: (newBody: string) => void) {
    const [isRecording, setIsRecording] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "ja-JP";

                recognitionRef.current.onresult = async (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log("Voice Command:", transcript);
                    setIsRecording(false);
                    await handleRefine(transcript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'service-not-allowed') {
                        alert("このブラウザでは音声認識が利用できません。標準ブラウザ（Safari/Chrome）でお試しください。");
                    } else if (event.error === 'not-allowed') {
                        alert("マイクの使用が許可されていません。");
                    }
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            }
        }
    }, [currentBody]); // Re-bind if needed

    const handleRefine = async (instruction: string) => {
        if (!instruction) return;
        setIsRefining(true);
        try {
            const result = await refineEmail(currentBody, instruction);
            if (result && result.body) {
                onUpdate(result.body);
            }
        } catch (error) {
            console.error("Refinement failed:", error);
            alert("AI修正に失敗しました。");
        } finally {
            setIsRefining(false);
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("このブラウザは音声認識をサポートしていません。");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    return {
        isRecording,
        isRefining,
        toggleRecording
    };
}
