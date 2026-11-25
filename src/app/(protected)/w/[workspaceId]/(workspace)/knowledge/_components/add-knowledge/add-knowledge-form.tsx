"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Globe,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  createWorkspaceKnowledge,
  addKnowledgeSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  normalizeUrl,
  KnowledgeApiError,
  type CreateKnowledgeInput,
} from "@/features/knowledge";
import { WizardShell } from "@/components/common/wizard-shell";
import { Input } from "@/components/ui/input";
import { KnowledgeStepper } from "./knowledge-stepper";
import { KnowledgeFormFooter } from "./knowledge-form-footer";

export interface AddKnowledgeFormProps {
  workspaceId: string;
}

export interface AddKnowledgeFormValues {
  sourceType: "file" | "website";
  file?: File;
  url?: string;
  name: string;
  description?: string;
}

interface ToastState {
  type: "error" | "success";
  title: string;
  message: string;
}

const STEP_SUBTITLES: Record<number, string> = {
  1: "Choose Source Type",
  2: "Upload or Link Source",
  3: "Source Information",
};

export function AddKnowledgeForm({ workspaceId }: AddKnowledgeFormProps) {
  const router = useRouter();
  const totalSteps = 3;

  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isNameAutoFilled, setIsNameAutoFilled] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRadioRef = useRef<HTMLButtonElement>(null);
  const websiteRadioRef = useRef<HTMLButtonElement>(null);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AddKnowledgeFormValues>({
    resolver: zodResolver(
      addKnowledgeSchema,
    ) as unknown as Resolver<AddKnowledgeFormValues>,
    mode: "onChange",
    defaultValues: {
      sourceType: "file",
      name: "",
      description: "",
    },
  });

  const sourceType = watch("sourceType");
  const selectedFile = watch("file");
  const websiteUrl = watch("url") || "";
  const sourceName = watch("name") || "";

  // Switch source types cleanly without wiping manually entered name/description
  const handleSourceTypeChange = (newType: "file" | "website") => {
    if (sourceType === newType) return;
    setValue("sourceType", newType);
    clearErrors(["file", "url"]);
    clearErrors("root");

    // If name was auto-filled, clear it so it re-autofills from the newly selected source
    if (isNameAutoFilled) {
      setValue("name", "");
      setIsNameAutoFilled(false);
    }
  };

  // Keyboard navigation for accessible radio group
  const handleRadioKeyDown = (
    e: React.KeyboardEvent,
    currentRadioType: "file" | "website",
  ) => {
    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowUp"
    ) {
      e.preventDefault();
      const nextType = currentRadioType === "file" ? "website" : "file";
      handleSourceTypeChange(nextType);
      if (nextType === "file") {
        fileRadioRef.current?.focus();
      } else {
        websiteRadioRef.current?.focus();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSourceTypeChange(currentRadioType);
    }
  };

  // File selection & validation
  const handleFileSelected = (file: File) => {
    clearErrors("file");

    const isMimeValid =
      ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      ) || /\.(pdf|docx|txt)$/i.test(file.name);

    if (!isMimeValid) {
      setError("file", {
        type: "manual",
        message: "Supported file types: PDF, DOCX, TXT",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("file", {
        type: "manual",
        message: "File size must not exceed 10MB",
      });
      return;
    }

    setValue("file", file, { shouldValidate: true });
  };

  const handleRemoveFile = () => {
    setValue("file", undefined as unknown as File, { shouldValidate: false });
    clearErrors("file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine whether current step allows continuing
  const canContinue = () => {
    if (currentStep === 1) {
      return Boolean(sourceType);
    }
    if (currentStep === 2) {
      if (sourceType === "file") {
        return Boolean(selectedFile && !errors.file);
      }
      return Boolean(websiteUrl.trim() && !errors.url);
    }
    return Boolean(sourceName.trim());
  };

  const handleNext = () => {
    if (isSubmitting) return;

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Validate step 2 input
      if (sourceType === "file") {
        const file = getValues("file");
        if (!file) {
          setError("file", {
            type: "manual",
            message: "Please upload or drop a document to continue",
          });
          return;
        }
        const isMimeValid =
          ALLOWED_MIME_TYPES.includes(
            file.type as (typeof ALLOWED_MIME_TYPES)[number],
          ) || /\.(pdf|docx|txt)$/i.test(file.name);

        if (!isMimeValid) {
          setError("file", {
            type: "manual",
            message: "Supported file types: PDF, DOCX, TXT",
          });
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          setError("file", {
            type: "manual",
            message: "File size must not exceed 10MB",
          });
          return;
        }

        // Auto-fill source name if empty or previously auto-filled
        const currentName = getValues("name")?.trim();
        if (!currentName || isNameAutoFilled) {
          setValue("name", file.name.replace(/\.[^/.]+$/, ""));
          setIsNameAutoFilled(true);
        }
      } else {
        const rawUrl = getValues("url")?.trim() || "";
        if (!rawUrl) {
          setError("url", {
            type: "manual",
            message: "Website URL is required",
          });
          return;
        }

        const normalized = normalizeUrl(rawUrl);
        try {
          const parsed = new URL(normalized);
          const parts = parsed.hostname.split(".");
          const valid =
            (parsed.protocol === "http:" || parsed.protocol === "https:") &&
            parts.length >= 2 &&
            (parts.pop()?.length ?? 0) >= 2;

          if (!valid) {
            setError("url", {
              type: "manual",
              message:
                "Please enter a valid website URL (e.g. https://example.com)",
            });
            return;
          }
        } catch {
          setError("url", {
            type: "manual",
            message:
              "Please enter a valid website URL (e.g. https://example.com)",
          });
          return;
        }

        // Auto-fill source name if empty or previously auto-filled
        const currentName = getValues("name")?.trim();
        if (!currentName || isNameAutoFilled) {
          try {
            const parsed = new URL(normalized);
            const auto = parsed.hostname.replace(/^www\./, "");
            setValue("name", auto || rawUrl);
          } catch {
            setValue("name", rawUrl);
          }
          setIsNameAutoFilled(true);
        }
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: AddKnowledgeFormValues) => {
    try {
      let payload: CreateKnowledgeInput;
      if (data.sourceType === "file") {
        if (!data.file) {
          setError("file", {
            type: "manual",
            message: "Please upload or drop a document to continue",
          });
          return;
        }
        payload = {
          kind: "file",
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          file: data.file,
        };
      } else {
        if (!data.url) {
          setError("url", {
            type: "manual",
            message: "Website URL is required",
          });
          return;
        }
        payload = {
          kind: "website",
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          url: normalizeUrl(data.url),
        };
      }

      await createWorkspaceKnowledge(workspaceId, payload);
      router.push(`/w/${workspaceId}/knowledge`);
    } catch (err: unknown) {
      if (err instanceof KnowledgeApiError) {
        if (err.code === "DUPLICATE_SOURCE") {
          const existingName =
            (err.details?.existingName as string) || data.name;
          const existingStatus =
            (err.details?.existingStatus as string) || "Ready";

          setToast({
            type: "error",
            title: "Duplicate Source Detected",
            message: `A source named "${existingName}" already exists with status "${existingStatus}".`,
          });

          setError("name", {
            type: "manual",
            message: `"${existingName}" already exists in this workspace. Please choose a different name.`,
          });
          return;
        }

        if (err.code === "PAYLOAD_TOO_LARGE") {
          setCurrentStep(2);
          setError("file", {
            type: "manual",
            message: err.message || "File size must not exceed 10MB.",
          });
          return;
        }

        if (err.code === "VALIDATION_ERROR") {
          setError("name", {
            type: "manual",
            message: err.message,
          });
          return;
        }

        setToast({
          type: "error",
          title: "Submission Error",
          message: err.message,
        });
        setError("root", {
          type: "manual",
          message: err.message,
        });
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to create knowledge source.";
        setToast({
          type: "error",
          title: "Error",
          message: msg,
        });
        setError("root", {
          type: "manual",
          message: msg,
        });
      }
    }
  };

  return (
    <WizardShell
      backHref={`/w/${workspaceId}/knowledge`}
      backTitle="Back to Knowledge"
      title="Add Knowledge Source"
      subtitle={`Step ${currentStep} of ${totalSteps} — ${STEP_SUBTITLES[currentStep]}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <KnowledgeStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepClick={(stepId) =>
            stepId < currentStep && setCurrentStep(stepId)
          }
        />

        {/* Floating / Inline Toast Notification for 409 Duplicate or API Errors */}
        {toast && (
          <div
            role="alert"
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-md transition-all ${
              toast.type === "error"
                ? "bg-wrong-50 border-wrong-200 text-wrong-900"
                : "bg-right-50 border-right-200 text-right-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-wrong-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-right-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-neutral-500 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Card Container: Design system token bg-neutral-50 */}
        <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 shadow-xs border border-neutral-200">
          {/* STEP 1: Choose Source Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Choose a source type
                </h2>
                <p className="text-sm text-secondary-500 mt-1">
                  Select how you want to add knowledge to your Workspace.
                </p>
              </div>

              <div
                role="radiogroup"
                aria-label="Choose source type"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* File Option */}
                <button
                  ref={fileRadioRef}
                  type="button"
                  role="radio"
                  aria-checked={sourceType === "file"}
                  tabIndex={sourceType === "file" ? 0 : -1}
                  onClick={() => handleSourceTypeChange("file")}
                  onKeyDown={(e) => handleRadioKeyDown(e, "file")}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer min-h-[140px] outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/40 ${
                    sourceType === "file"
                      ? "border-secondary-500 bg-neutral-100/90 shadow-xs ring-1 ring-secondary-500/30"
                      : "border-neutral-200 bg-neutral-100/40 hover:border-neutral-300 hover:bg-neutral-100/70 text-neutral-900"
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
                          : "border-2 border-neutral-300 bg-transparent"
                      }`}
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-neutral-900 block">
                      File Upload
                    </span>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Upload a PDF, DOCX, or TXT document (up to 10MB).
                    </p>
                  </div>
                </button>

                {/* Website Option */}
                <button
                  ref={websiteRadioRef}
                  type="button"
                  role="radio"
                  aria-checked={sourceType === "website"}
                  tabIndex={sourceType === "website" ? 0 : -1}
                  onClick={() => handleSourceTypeChange("website")}
                  onKeyDown={(e) => handleRadioKeyDown(e, "website")}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all cursor-pointer min-h-[140px] outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/40 ${
                    sourceType === "website"
                      ? "border-secondary-500 bg-neutral-100/90 shadow-xs ring-1 ring-secondary-500/30"
                      : "border-neutral-200 bg-neutral-100/40 hover:border-neutral-300 hover:bg-neutral-100/70 text-neutral-900"
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
                          : "border-2 border-neutral-300 bg-transparent"
                      }`}
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-neutral-900 block">
                      Website URL
                    </span>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Add content from a public website or documentation.
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
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Upload File
                    </h2>
                    <p className="text-sm text-secondary-500 mt-1">
                      Drag and drop your document here, or browse files from
                      your device.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                  />

                  {!selectedFile ? (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload document file. Drag and drop or press Enter to browse"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const dropped = e.dataTransfer.files?.[0];
                        if (dropped) handleFileSelected(dropped);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary-500/40 ${
                        isDragging
                          ? "border-secondary-500 bg-secondary-500/10 ring-2 ring-secondary-500/20"
                          : errors.file
                            ? "border-wrong-500 bg-wrong-500/5 hover:border-wrong-600"
                            : "border-neutral-300 bg-neutral-100/50 hover:bg-neutral-100 hover:border-neutral-400"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-secondary-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <Upload className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Drag and drop your file here, or{" "}
                        <span className="text-secondary-500 underline font-bold">
                          browse
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1.5">
                        Supported: PDF, DOCX, TXT (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-4 flex items-center justify-between shadow-xs bg-neutral-100 border border-neutral-200">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-neutral-200 text-secondary-500 flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •
                            Ready to upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Remove file"
                        aria-label="Remove uploaded file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {errors.file && (
                    <p className="text-xs text-wrong-500 mt-2">
                      {errors.file.message}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Add a website URL
                    </h2>
                    <p className="text-sm text-secondary-500 mt-1">
                      Enter the webpage or documentation link you want to
                      ingest.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="website-url"
                      className="text-xs font-semibold text-neutral-900"
                    >
                      Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <Input
                        id="website-url"
                        type="url"
                        surface="light"
                        placeholder="https://docs.example.com"
                        className="pl-10"
                        isError={Boolean(errors.url)}
                        {...register("url")}
                        onChange={(e) => {
                          setValue("url", e.target.value);
                          if (errors.url) clearErrors("url");
                        }}
                      />
                    </div>
                    {errors.url && (
                      <p className="text-xs text-wrong-500">
                        {errors.url.message}
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
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Source information
                </h2>
                <p className="text-sm text-secondary-500 mt-1">
                  Provide a name and optional description to identify this
                  knowledge source.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="source-name"
                    className="text-xs font-semibold text-neutral-900 flex items-center justify-between"
                  >
                    <span>Source Name</span>
                    <span className="text-[11px] text-secondary-500 font-medium">
                      Required
                    </span>
                  </label>
                  <Input
                    id="source-name"
                    surface="light"
                    placeholder="e.g. Customer Support Policy 2026"
                    isError={Boolean(errors.name)}
                    {...register("name", {
                      onChange: () => {
                        setIsNameAutoFilled(false);
                        if (errors.name) clearErrors("name");
                      },
                    })}
                  />
                  {errors.name ? (
                    <p className="text-xs text-wrong-500">
                      {errors.name.message}
                    </p>
                  ) : (
                    <p className="text-xs text-secondary-500">
                      Use a name that helps your team recognize this document or
                      resource.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="source-description"
                      className="text-xs font-semibold text-neutral-900"
                    >
                      Description
                    </label>
                    <span className="text-[11px] text-neutral-400 font-normal">
                      Optional
                    </span>
                  </div>
                  <textarea
                    id="source-description"
                    rows={3}
                    placeholder="Briefly describe what this knowledge source contains..."
                    className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all border outline-none focus:ring-2 resize-none ${
                      errors.description
                        ? "bg-wrong-50 text-neutral-950 placeholder:text-neutral-400 border-wrong-500 focus:border-wrong-500 focus:ring-wrong-500/20"
                        : "bg-neutral-50 text-neutral-950 placeholder:text-neutral-400 border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-secondary-500/20"
                    }`}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-wrong-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <KnowledgeFormFooter
            workspaceId={workspaceId}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            isNextDisabled={!canContinue() || isSubmitting}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </WizardShell>
  );
}

export default AddKnowledgeForm;
