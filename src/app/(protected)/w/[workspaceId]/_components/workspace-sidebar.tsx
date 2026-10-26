"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Plug,
  BookOpen,
  MessageSquare,
  History,
  ShieldCheck,
  Settings,
  User,
  CreditCard,
  ChevronDown,
} from "lucide-react";

interface WorkspaceSidebarProps {
  workspaceId: string;
  onWorkspaceClick?: () => void;
}

export function WorkspaceSidebar({
  workspaceId,
  onWorkspaceClick,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();

  // TODO: Fetch or sync from Workspace Context / Backend API
  const [workspaces] = useState([
    { id: "ws-ai-production", name: "AI Production Hub" },
    { id: "ws-enterprise-ops", name: "Enterprise Operations" },
    { id: "ws-customer-fleet", name: "Customer Support Fleet" },
    { id: "amr-khaled", name: "Amr Khaled" },
  ]);

  // Find workspace by ID, or fallback gracefully if ID not found yet
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);
  const activeWorkspaceName = currentWorkspace?.name || "Workspace";
  const workspaceInitials = activeWorkspaceName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  return (
    <aside className="w-80 h-screen bg-secondary-950 border-r border-secondary-50/10 flex flex-col justify-between shrink-0 select-none z-30">
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="px-5 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="relative h-7 w-7 shrink-0">
              <Image
                src="/Logo.png"
                alt="FelOps Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="relative h-5 w-24 shrink-0">
              <Image
                src="/felops.svg"
                alt="FelOps"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Workspace Button */}
        <div className="px-3 pt-3 pb-2">
          <button
            type="button"
            onClick={onWorkspaceClick}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900
            border border-secondary-50 hover:border-secondary-50/40 hover:bg-neutral-900/70 
            transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg bg-secondary-500 border border-secondary-800
               text-secondary-50 font-bold text-[11px] flex items-center justify-center shrink-0"
              >
                {workspaceInitials}
              </div>
              <span className="text-xs font-semibold text-secondary-50 truncate">
                {activeWorkspaceName}
              </span>
            </div>
            <ChevronDown
              className="w-6 h-6 text-neutral-400 group-hover:text-secondary-50 
            transition-colors shrink-0 ml-1"
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-secondary-800 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Group 1: Workspace */}
        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Workspace
          </p>
          <nav className="space-y-0.5">
            <Link
              href={`/w/${workspaceId}`}
              className={`flex items-center gap-3 px-3 py-4 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname === `/w/${workspaceId}`
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/agents`}
              className={`flex items-center gap-3 px-3  py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/agents`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Agents</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/integrations`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/integrations`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <Plug className="w-4 h-4 shrink-0" />
              <span>Integrations & Actions</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/knowledge`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/knowledge`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Knowledge</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/conversations`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/conversations`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Conversations</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/audit-trail`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/audit-trail`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Audit trail</span>
            </Link>
          </nav>
        </div>

        {/* Group 2: Workspace Management */}
        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Workspace Management
          </p>
          <nav className="space-y-0.5">
            <Link
              href={`/w/${workspaceId}/policies`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/policies`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Policies & Permissions</span>
            </Link>

            <Link
              href={`/w/${workspaceId}/settings`}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith(`/w/${workspaceId}/settings`)
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Workspace settings</span>
            </Link>
          </nav>
        </div>

        {/* Group 3: Account */}
        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Account
          </p>
          <nav className="space-y-0.5">
            <Link
              href="/account/profile"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith("/account/profile")
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile & Account</span>
            </Link>

            <Link
              href="/account/billing"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm transition-colors ${
                pathname.startsWith("/account/billing")
                  ? "bg-secondary-500 text-secondary-50 font-semibold"
                  : "text-secondary-50 hover:text-secondary-50"
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Billing</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
