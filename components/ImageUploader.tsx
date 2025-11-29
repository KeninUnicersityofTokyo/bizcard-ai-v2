"use client";

import { useState, useRef } from "react";
import { Camera as CameraIcon, Upload } from "lucide-react";

interface ImageUploaderProps {
    onImageSelected: (base64: string) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

            if (file.size > MAX_SIZE) {
                alert("ファイルサイズが大きすぎます。5MB以下の画像を選択してください。");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                alert("対応していないファイル形式です。JPG, PNG, WebP形式の画像を選択してください。");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                onImageSelected(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CameraIcon className="w-5 h-5 text-gray-900" />
                Scan Business Card
            </h2>

            <div
                className="relative aspect-video bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group hover:border-gray-400 transition-colors cursor-pointer"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Business Card Preview"
                        className="w-full h-full object-contain z-10"
                        onError={(e) => {
                            console.error("Image load error", e);
                            alert("画像の表示に失敗しました。別の画像をお試しください。");
                            setPreview(null);
                        }}
                    />
                ) : (
                    <div className="text-center p-6 z-10 pointer-events-none">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-gray-600 transition-colors" />
                        <p className="text-gray-500 text-sm font-medium">
                            Tap to launch camera<br />or select image
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            </div>

            {preview && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering camera again
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-colors"
                >
                    Retake
                </button>
            )}
        </div>
    );
}
