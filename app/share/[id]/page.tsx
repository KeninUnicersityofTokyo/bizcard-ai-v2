import { getSharedItem } from "@/lib/db";
import { SharedItem } from "@/types";
import { notFound } from "next/navigation";
import { Mail, Building2, User, Calendar, Copy, Check } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton"; // We might need to create this or inline it

// Helper component for Copy Button since this is a server component
function CopyTextButton({ text }: { text: string }) {
    return (
        <CopyButton text={text} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-gray-600 rounded-lg shadow-sm backdrop-blur-sm transition-all" />
    );
}

export default async function SharedPage({ params }: { params: { id: string } }) {
    const item = await getSharedItem(params.id) as SharedItem | null;

    if (!item) {
        notFound();
    }

    const { data } = item;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block">
                        <h1 className="text-2xl font-black tracking-tighter flex items-center justify-center gap-2 text-gray-900">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">R</span>
                            </div>
                            ReCard AI
                        </h1>
                    </Link>
                    <p className="mt-4 text-gray-500">
                        共有された名刺情報とメールドラフト
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* Contact Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.name}</h2>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        {data.company}
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {data.email}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                    <div className="flex items-center justify-end gap-1 mb-1">
                                        <Calendar className="w-3 h-3" />
                                        Created
                                    </div>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Draft */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Generated Email
                            </h3>
                        </div>

                        <div className="p-6 sm:p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Subject
                                </label>
                                <div className="text-gray-900 font-medium">
                                    {data.generatedEmail.subject}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Body
                                </label>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {data.generatedEmail.body}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        自分もReCard AIを使ってみる
                    </Link>
                </div>
            </div>
        </div>
    );
}
