import {
  Network,
  Settings,
  TestTube,
  Upload,
  Menu,
  X,
  Play,
  Github,
  Sparkles,
  ShieldAlert,
  Loader2,
  FileCode2,
  Database,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BuildButton } from "@/components/ide/BuildButton";
import { Button } from "@/components/ui/button";
import { type NetworkKey } from "@/lib/networkConfig";
import { ImportWizard } from "@/components/projects/ImportWizard";
import CiConfigGenerator from "@/components/modals/CiConfigGenerator";
import StateMockEditor from "@/components/modals/StateMockEditor";
import { SettingsModal } from "@/components/ide/SettingsModal";
import { WalletManager } from "@/components/WalletManager";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { GitBlameToggle } from "@/components/editor/GitBlameLines";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { SaveToCloudButton } from "@/components/cloud/SaveToCloudButton";
import { useAuth } from "@/hooks/useAuth";
import { LiveShareButton } from "@/components/ide/LiveShareButton";
import { useLiveShareStore } from "@/store/useLiveShareStore";

/* ✅ ADD THIS */
import NotificationCenter from "@/components/notifications/NotificationCenter";

type BuildState = "idle" | "building" | "success" | "error";

interface ToolbarProps {
  onCompile: () => void;
  onDeploy: () => void;
  onTest: () => void;
  isCompiling?: boolean;
  buildState?: BuildState;
  network?: NetworkKey;
  onNetworkChange?: (network: NetworkKey) => void;
  saveStatus?: string;
  onRunClippy?: () => void;
  isRunningClippy?: boolean;
  onRunAudit?: () => void;
  isRunningAudit?: boolean;
}

export function Toolbar({
  onCompile,
  onDeploy,
  onTest,
  isCompiling: propIsCompiling,
  buildState: propBuildState,
  network: propNetwork,
  onNetworkChange,
  saveStatus: propSaveStatus,
  onRunClippy,
  isRunningClippy = false,
  onRunAudit,
  isRunningAudit = false,
}: ToolbarProps) {
  const {
    isCompiling: storeIsCompiling,
    buildState: storeBuildState,
    network: storeNetwork,
    setNetwork,
    saveStatus: storeSaveStatus,
    mockLedgerState,
    setMockLedgerState,
  } = useWorkspaceStore();

  const isCompiling = propIsCompiling ?? storeIsCompiling;
  const buildState = propBuildState ?? storeBuildState;
  const network = propNetwork ?? storeNetwork;
  const saveStatus = propSaveStatus ?? storeSaveStatus;

  const changeNetwork = useMemo(
    () => onNetworkChange ?? setNetwork,
    [onNetworkChange, setNetwork],
  );

  const { mode } = useLiveShareStore();
  const { isAuthenticated } = useAuth();
  const isReadOnly = mode === "recipient";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [ciOpen, setCiOpen] = useState(false);
  const [stateEditorOpen, setStateEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasMockState = mockLedgerState.entries.length > 0;

  useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener("ide:open-settings", handler);
    return () => window.removeEventListener("ide:open-settings", handler);
  }, []);

  return (
    <div className="border-b border-border bg-toolbar-bg">
      {/* ── Desktop toolbar ── */}
      <div className="hidden items-center justify-between px-3 py-1.5 md:flex">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <span className="mr-2 font-mono text-sm font-semibold text-primary">
            Kit CANVAS
          </span>

          <BuildButton onClick={onCompile} isBuilding={isCompiling} state={isCompiling ? "building" : buildState} disabled={isReadOnly} />
          
          <Button onClick={onDeploy} variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" disabled={isReadOnly}>
            <Upload className="h-3.5 w-3.5" />
            Deploy
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onTest} className="h-8 gap-1.5 text-xs" disabled={isReadOnly}>
            <TestTube className="h-3.5 w-3.5" />
            Test
          </Button>

          {onRunClippy ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRunClippy} disabled={isRunningClippy || isReadOnly} className="h-8 gap-1.5 text-xs">
              {isRunningClippy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Run Clippy
            </Button>
          )}

          {onRunAudit ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRunAudit} disabled={isRunningAudit || isReadOnly} className="h-8 gap-1.5 text-xs">
              {isRunningAudit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              Audit
            </Button>
          )}

          <GitBlameToggle />

          <Button onClick={() => setImportOpen(true)} variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" disabled={isReadOnly}>
            <Github className="h-3.5 w-3.5" />
            Import
          </Button>
          <Button onClick={() => setCiOpen(true)} variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" disabled={isReadOnly}>
            <FileCode2 className="h-3.5 w-3.5" />
            Export CI
          </Button>
          <Button
            onClick={() => setStateEditorOpen(true)}
            variant="ghost"
            size="sm"
            className={`h-8 gap-1.5 text-xs ${hasMockState ? "text-primary" : ""}`}
            title="Mock Ledger State"
            disabled={isReadOnly}
          >
            <Database className="h-3.5 w-3.5" />
            Mock State{hasMockState ? ` (${mockLedgerState.entries.length})` : ""}
          </Button>

          <SaveToCloudButton disabled={isReadOnly} />

          <LiveShareButton />

          {saveStatus && (
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              {saveStatus}
            </span>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* ✅ NOTIFICATION BELL HERE */}
          <NotificationCenter />

          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Network className="h-3.5 w-3.5" />
            <select
              value={network}
              onChange={(e) => changeNetwork(e.target.value as NetworkKey)}
              className="rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground"
            >
              <option value="testnet">Testnet</option>
              <option value="futurenet">Futurenet</option>
              <option value="mainnet">Mainnet</option>
              <option value="local">Local</option>
            </select>
          </label>

          <WalletManager />
          {isAuthenticated ? <UserMenu /> : <SignInButton />}

          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Mobile expanded menu ── */}
      {mobileMenuOpen ? (
        <div className="flex flex-col gap-2 border-b border-border px-2 pb-2 md:hidden">
          <Button
            onClick={() => {
              onCompile();
              setMobileMenuOpen(false);
            }}
            disabled={isCompiling}
            className="h-9 flex-1 gap-1 text-[11px]"
          >
            <Play className="h-3 w-3" />
            {isCompiling ? "..." : "Build"}
          </Button>

          <Button
            onClick={() => {
              onDeploy();
              setMobileMenuOpen(false);
            }}
            variant="outline"
            className="h-9 flex-1 gap-1 text-[11px]"
          >
            <Upload className="h-3 w-3" />
            Deploy
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 gap-1 text-[11px]"
            onClick={() => {
              onTest();
              setMobileMenuOpen(false);
            }}
          >
            Test
          </Button>

          {onRunClippy ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 flex-1 gap-1 text-[11px]"
              onClick={() => {
                onRunClippy();
                setMobileMenuOpen(false);
              }}
              disabled={isRunningClippy}
            >
              {isRunningClippy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Clippy
            </Button>
          ) : null}

          {onRunAudit ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 flex-1 gap-1 text-[11px]"
              onClick={() => {
                onRunAudit();
                setMobileMenuOpen(false);
              }}
              disabled={isRunningAudit}
            >
              {isRunningAudit ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
              Audit
            </Button>
          ) : null}

          <Button
            variant="outline"
            className="h-9 flex-1 gap-1 text-[11px]"
            onClick={() => {
              setImportOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Github className="h-3 w-3" />
            Import GitHub
          </Button>

          <Button
            variant="outline"
            className="h-9 flex-1 gap-1 text-[11px]"
            onClick={() => {
              setCiOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <FileCode2 className="h-3 w-3" />
            Export CI
          </Button>
          <Button
            className={`h-9 flex-1 gap-1 text-[11px] ${hasMockState ? "text-primary" : ""}`}
            onClick={() => {
              setStateEditorOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Database className="h-3 w-3" />
            Mock State
          </Button>

          <LiveShareButton />


          <Button
            variant="outline"
            className="h-9 flex-1 gap-1 text-[11px]"
            onClick={() => {
              setSettingsOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Settings className="h-3 w-3" />
            Settings
          </Button>
        </div>
      ) : null}

      <ImportGithubModal open={importOpen} onClose={() => setImportOpen(false)} />
      <CiConfigGenerator open={ciOpen} onOpenChange={setCiOpen} />
      <StateMockEditor
        open={stateEditorOpen}
        onOpenChange={setStateEditorOpen}
        value={mockLedgerState}
        onSave={setMockLedgerState}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}