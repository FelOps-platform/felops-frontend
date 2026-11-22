"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Globe, FileText, X } from "lucide-react";
import { createWorkspaceKnowledge } from "../../services/knowledge.service";
import { KnowledgeStepper } from "./knowledge-stepper";
import { KnowledgeFormFooter } from "./knowledge-form-footer";

export interface AddKnowledgeFormProps {
  workspaceId: string;
}

function isValidUrl(urlString: string): boolean {
  const trimmed = urlString.trim();
  if (!trimmed) return false;
  try {
    const toTest = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(toTest);
    const parts = parsed.hostname.split(".");
    return Boolean(
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parts.length >= 2 &&
        (parts.pop()?.length ?? 0) >= 2,
    );
  } catch {
    return false;
  }
}

export function AddKnowledgeForm({ workspaceId }: AddKnowledgeFormProps) {
  const router = useRouter();
  const totalSteps = 3;

  const [currentStep, setCurrentStep] = useState(1);
  const [sourceType, setSourceType] = useState<"file" | "website">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrlValid = isValidUrl(url);

  const canContinue =
    currentStep === 1
      ? Boolean(sourceType)
      : currentStep === 2
        ? sourceType === "file"
          ? Boolean(file)
          : isUrlValid
        : Boolean(name.trim());

  const handleNext = () => {
    if (!canContinue || isSubmitting) return;

    if (currentStep < totalSteps) {
      if (currentStep === 2 && !name.trim()) {
        setName(file ? file.name.replace(/\.[^/.]+$/, "") : url.trim());
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createWorkspaceKnowledge(workspaceId, {
        name: name.trim(),
        type: sourceType === "file" ? "PDF" : "Website",
        source:
          sourceType === "file"
            ? file?.name || ""
            : /^https?:\/\//i.test(url.trim())
              ? url.trim()
              : `https://${url.trim()}`,
        description: description.trim() || undefined,
        file: file || undefined,
      });

      router.push(`/w/${workspaceId}/knowledge`);
    } catch (error) {
      console.error("Failed to create knowledge source:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <Link
          href={`/w/${workspaceId}/knowledge`}
          className="w-9 h-9 rounded-xl bg-secondary-900/60 border border-secondary-50/20 flex items-center justify-center text-secondary-200 hover:bg-secondary-900 hover:text-secondary-50 transition-all shadow-xs mb-5 inline-flex cursor-pointer"
          title="Back to Knowledge"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold text-secondary-50 tracking-tight">
          Add Knowledge Source
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
          Add a source to your Workspace. It can be assigned to eligible Agents
          after processing.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <KnowledgeStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepClick={(stepId) =>
            stepId < currentStep && setCurrentStep(stepId)
          }
        />

        <div className="bg-secondary-900/40 rounded-3xl p-6 sm:p-8 shadow-xl border border-secondary-50/10 text-secondary-50 backdrop-blur-xs">
          {/* STEP 1: Choose Source Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-secondary-50 tracking-tight">
                  Choose a source type
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Select how you want to add knowledge to your Workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Option */}
                <button
                  type="button"
                  onClick={() => setSourceType("file")}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer min-h-[140px] ${
                    sourceType === "file"
                      ? "border-secondary-500 bg-secondary-500/10 shadow-xs"
                      : "border-secondary-50/15 bg-secondary-950/40 hover:border-secondary-50/30 text-secondary-50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-secondary-500 text-secondary-50 flex items-center justify-center shadow-xs">
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${
                        sourceType === "file"
                          ? "bg-secondary-500"
                          : "border-2 border-secondary-50/30 bg-transparent"
                      }`}
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-secondary-50 block">
                      File Upload
                    </span>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Upload a document from your device.
                    </p>
                  </div>
                </button>

                {/* Website Option */}
                <button
                  type="button"
                  onClick={() => setSourceType("website")}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer min-h-[140px] ${
                    sourceType === "website"
                      ? "border-secondary-500 bg-secondary-500/10 shadow-xs"
                      : "border-secondary-50/15 bg-secondary-950/40 hover:border-secondary-50/30 text-secondary-50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-secondary-500 text-secondary-50 flex items-center justify-center shadow-xs">
                      <Globe className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${
                        sourceType === "website"
                          ? "bg-secondary-500"
                          : "border-2 border-secondary-50/30 bg-transparent"
                      }`}
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-secondary-50 block">
                      Website URL
                    </span>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Add content from a public website.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Input based on Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {sourceType === "file" ? (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-50 tracking-tight">
                      Upload File
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Drag and drop your document here, or browse files from
                      your device.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) setFile(selected);
                    }}
                  />

                  {!file ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) setFile(dropped);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-secondary-50/20 bg-secondary-950/40 hover:border-secondary-50/40 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary-900 border border-secondary-50/15 text-secondary-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <Upload className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <p className="text-sm font-semibold text-secondary-50">
                        Drag and drop your file here, or{" "}
                        <span className="text-secondary-400 underline font-bold">
                          browse
                        </span>
                      </p>
                      <p className="text-xs text-neutral-400 mt-1.5">
                        Supported: PDF (Max 25MB)
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4 flex items-center justify-between shadow-xs bg-secondary-950/50 border border-secondary-50/10">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-secondary-900 border border-secondary-50/15 text-secondary-200 flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-secondary-50 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {(file.size / 1024 / 1024).toFixed(1)} MB • Ready to
                            upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-secondary-50 hover:bg-secondary-800 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-secondary-50 tracking-tight">
                      Add a website URL
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Enter the webpage or documentation link you want to
                      ingest.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      Website URL
                    </label>
                    <div className="flex items-center gap-2.5 bg-secondary-950/60 border border-secondary-50/20 rounded-xl px-3.5 py-2.5 focus-within:border-secondary-500 focus-within:ring-2 focus-within:ring-secondary-500/20 transition-all">
                      <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://docs.example.com"
                        className="w-full text-sm outline-none text-secondary-50 placeholder:text-neutral-500 bg-transparent"
                      />
                    </div>
                    {url.trim().length > 0 && !isUrlValid && (
                      <p className="text-xs text-wrong-400">
                        Please enter a valid website URL (e.g.
                        https://example.com)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Source Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-secondary-50 tracking-tight">
                  Source information
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Provide a name and optional description to identify this
                  knowledge source.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Source Name</span>
                    <span className="text-[11px] text-secondary-400 font-medium">
                      Required
                    </span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Customer Support Policy 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary-950/60 border border-secondary-50/20 text-sm text-secondary-50 placeholder:text-neutral-500 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">
                      Description
                    </label>
                    <span className="text-[11px] text-neutral-400 font-normal">
                      Optional
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this knowledge source contains..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-secondary-950/60 border border-secondary-50/20 text-sm text-secondary-50 placeholder:text-neutral-500 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <KnowledgeFormFooter
            workspaceId={workspaceId}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            isNextDisabled={!canContinue || isSubmitting}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

export default AddKnowledgeForm;
