import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ExternalLink, CheckCircle2, Circle, Loader2, Eye, EyeOff,
  ChevronRight, ChevronLeft, Bot, Hash, Shield, Key,
  AlertCircle, Info, Copy, Check
} from "lucide-react";

const STEPS = [
  {
    id: "create_app",
    title: "Create a Discord Application",
    icon: Bot,
    description: "First, create an application in the Discord Developer Portal."
  },
  {
    id: "guild_id",
    title: "Get your Server (Guild) ID",
    icon: Hash,
    description: "Find your Discord server's unique ID."
  },
  {
    id: "role_id",
    title: "Create & Copy the Role ID",
    icon: Shield,
    description: "Create a role for paying members and get its ID."
  },
  {
    id: "bot_token",
    title: "Get your Bot Token",
    icon: Key,
    description: "Copy the bot token from the Developer Portal."
  },
  {
    id: "validate",
    title: "Validate & Activate",
    icon: CheckCircle2,
    description: "Test the connection and save your configuration."
  }
];

function StepIndicator({ steps, currentStep, completedSteps }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === idx;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isCurrent
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-400"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-medium hidden sm:block text-center max-w-[70px] leading-tight ${
                isCurrent ? "text-indigo-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
              }`}>{step.title.split(" ").slice(0, 2).join(" ")}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-colors ${isCompleted ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-indigo-500 transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-500 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function InstructionStep({ number, text, image }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
    </div>
  );
}

// Step 0: Create App
function StepCreateApp({ onNext }) {
  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-indigo-800 mb-3">Follow these steps in the Discord Developer Portal:</p>
        <div className="space-y-3">
          <InstructionStep number="1" text='Go to discord.com/developers/applications and click "New Application".' />
          <InstructionStep number="2" text='Give your app a name (e.g. "MyShop Access Bot") and click "Create".' />
          <InstructionStep number="3" text='In the left sidebar, click "Bot" (the bot is created automatically — no "Add Bot" needed).' />
          <InstructionStep number="4" text='Scroll down to "Privileged Gateway Intents" and enable "Server Members Intent".' />
          <InstructionStep number="5" text='Click "Save Changes".' />
        </div>
      </div>
      <a
        href="https://discord.com/developers/applications"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Bot className="w-4 h-4" />
        Open Discord Developer Portal
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">Invite the bot to your server:</p>
        </div>
        <div className="space-y-3">
          <InstructionStep number="6" text='Still in the Developer Portal, click "OAuth2" in the left sidebar.' />
          <InstructionStep number="7" text='Click "URL Generator" in the sub-menu that appears under OAuth2.' />
          <InstructionStep number="8" text='Under "Scopes", tick the checkbox "bot".' />
          <InstructionStep number="9" text='A new section "Bot Permissions" appears below. Tick "Manage Roles".' />
          <InstructionStep number="10" text='Scroll down and copy the "Generated URL" at the bottom of the page.' />
          <InstructionStep number="11" text="Paste that URL in your browser, select your server, and click Authorise. Your bot is now added!" />
        </div>
      </div>
      <Button onClick={onNext} className="w-full bg-indigo-600 hover:bg-indigo-700">
        I've created the bot & added it to my server <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// Step 1: Guild ID
function StepGuildId({ value, onChange, onNext, onBack }) {
  const isValid = /^\d{17,20}$/.test(value.trim());
  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-indigo-800">How to find your Server ID:</p>
        <div className="space-y-3">
          <InstructionStep number="1" text="In Discord, open User Settings → Advanced → enable Developer Mode." />
          <InstructionStep number="2" text="Close settings and right-click on your server icon in the left sidebar." />
          <InstructionStep number="3" text='Click "Copy Server ID" and paste it below.' />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Server (Guild) ID</label>
          <Tooltip text="Your Discord server's unique identifier. It's a long number like 1234567890123456789. Enable Developer Mode in Discord settings to see it." />
        </div>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="e.g. 1234567890123456789"
            className={`font-mono text-sm pr-10 ${value && !isValid ? "border-red-300 focus:ring-red-200" : value && isValid ? "border-emerald-300 focus:ring-emerald-200" : ""}`}
          />
          {value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <AlertCircle className="w-4 h-4 text-red-400" />
              }
            </div>
          )}
        </div>
        {value && !isValid && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Server ID should be 17-20 digits only.
          </p>
        )}
        {value && isValid && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Looks like a valid Server ID!
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Step 2: Role ID
function StepRoleId({ value, onChange, onNext, onBack }) {
  const isValid = /^\d{17,20}$/.test(value.trim());
  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-indigo-800">How to create & find a Role ID:</p>
        <div className="space-y-3">
          <InstructionStep number="1" text="In Discord, open your Server Settings → Roles." />
          <InstructionStep number="2" text='Click "Create Role", give it a name (e.g. "Member" or "VIP"), and save.' />
          <InstructionStep number="3" text="Right-click the role → Copy Role ID." />
          <InstructionStep number="4" text='Go back to Server Settings → Roles. You will see a list of roles. Your bot has its own role (named after your bot app). Drag that bot role ABOVE the member role you just created. Discord only allows a bot to assign roles that are ranked lower than its own role.' />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Role ID</label>
          <Tooltip text="The ID of the Discord role you want to assign to customers after payment. The bot must have a higher role than this one to be able to assign it." />
        </div>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="e.g. 9876543210987654321"
            className={`font-mono text-sm pr-10 ${value && !isValid ? "border-red-300" : value && isValid ? "border-emerald-300" : ""}`}
          />
          {value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            </div>
          )}
        </div>
        {value && !isValid && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Role ID should be 17-20 digits only.</p>}
        {value && isValid && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Looks like a valid Role ID!</p>}
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700"><strong>Important:</strong> In Discord, a bot can only assign roles that are ranked <strong>below</strong> its own role. Go to Server Settings → Roles, find your bot's role (named after your bot app), and drag it <strong>above</strong> the member role you just created. If you skip this, the bot will fail to grant access after payment.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

// Step 3: Bot Token
function StepBotToken({ value, onChange, onNext, onBack }) {
  const [show, setShow] = useState(false);
  const isValid = value.trim().length > 40 && value.includes(".");
  return (
    <div className="space-y-5">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-indigo-800">How to get your Bot Token:</p>
        <div className="space-y-3">
          <InstructionStep number="1" text="Go to Discord Developer Portal → Your Application → Bot." />
          <InstructionStep number="2" text={"Click \"Reset Token\" and confirm. Copy the token immediately — it won't be shown again!"} />
          <InstructionStep number="3" text="Paste it in the field below." />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Bot Token</label>
          <Tooltip text="Your bot's secret token from the Discord Developer Portal. Never share this publicly — it gives full control over your bot." />
        </div>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="Paste your bot token here..."
            className={`font-mono text-xs pr-20 ${value && !isValid ? "border-red-300" : value && isValid ? "border-emerald-300" : ""}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {value && isValid && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {value && !isValid && <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>
        </div>
        {value && !isValid && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> This doesn't look like a valid bot token.</p>}
        {value && isValid && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Token format looks correct.</p>}
      </div>
      <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-2">
        <Shield className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-700"><strong>Security:</strong> Your token is stored encrypted and never exposed in the frontend. Treat it like a password — never share it publicly.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

// Step 4: Validate
function StepValidate({ form, onValidate, validationResult, validating, onBack, onSave, saving }) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700 mb-2">Configuration Summary</p>
        <div className="space-y-2">
          {[
            { label: "Server ID", value: form.guild_id, icon: Hash },
            { label: "Role ID", value: form.role_id, icon: Shield },
            { label: "Bot Token", value: form.bot_token ? `${form.bot_token.slice(0, 8)}••••••••` : "", icon: Key }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                {label}
              </div>
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{value}</code>
                <CopyButton value={label === "Bot Token" ? form.bot_token : value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!validationResult && (
        <Button
          onClick={onValidate}
          disabled={validating}
          variant="outline"
          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          {validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {validating ? "Testing connection..." : "Test Discord Connection"}
        </Button>
      )}

      {validationResult && (
        <div className={`rounded-xl p-4 flex gap-3 ${validationResult.success ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
          {validationResult.success
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className={`text-sm font-semibold ${validationResult.success ? "text-emerald-800" : "text-red-800"}`}>
              {validationResult.success ? "Connection successful!" : "Connection failed"}
            </p>
            <p className={`text-xs mt-0.5 ${validationResult.success ? "text-emerald-700" : "text-red-600"}`}>
              {validationResult.message}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button
          onClick={onSave}
          disabled={saving || !validationResult?.success}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Save & Activate
        </Button>
      </div>
    </div>
  );
}

export default function DiscordSetupWizard({ initialForm, plugin, userId, onSaved, onCancel }) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [form, setForm] = useState(initialForm || {
    guild_id: "", role_id: "", bot_token: "",
    invite_channel_id: "", welcome_message: "", payment_link_ids: [], enabled: true
  });
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);

  const completeStep = (stepId) => {
    setCompletedSteps(prev => prev.includes(stepId) ? prev : [...prev, stepId]);
  };

  const goNext = (stepId) => {
    completeStep(stepId);
    setStep(s => s + 1);
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch(`https://discord.com/api/v10/guilds/${form.guild_id}`, {
        headers: { Authorization: `Bot ${form.bot_token}` }
      });
      if (res.ok) {
        const guild = await res.json();
        setValidationResult({ success: true, message: `Connected to server: "${guild.name}" with ${guild.member_count || "?"} members.` });
      } else if (res.status === 401) {
        setValidationResult({ success: false, message: "Invalid bot token. Please double-check it in the Discord Developer Portal." });
      } else if (res.status === 403) {
        setValidationResult({ success: false, message: "Bot doesn't have access to this server. Make sure the bot is added to your server." });
      } else if (res.status === 404) {
        setValidationResult({ success: false, message: "Server not found. Check the Guild ID and make sure the bot is in the server." });
      } else {
        setValidationResult({ success: false, message: `Unexpected error (${res.status}). Please try again.` });
      }
    } catch {
      setValidationResult({ success: false, message: "Network error. Please check your connection and try again." });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (plugin) {
        await base44.entities.MerchantPlugin.update(plugin.id, { ...form, enabled: true });
      } else {
        await base44.entities.MerchantPlugin.create({
          ...form, enabled: true, merchant_id: userId, plugin_type: "discord_gate"
        });
      }
      toast.success("Discord Gate activated!");
      onSaved?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStepData = STEPS[step];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-slate-900">Discord Gate Setup</h2>
          <Badge className="bg-indigo-100 text-indigo-700 text-xs">Step {step + 1} of {STEPS.length}</Badge>
        </div>
        <p className="text-sm text-slate-500">{currentStepData.description}</p>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} completedSteps={completedSteps} />

      <div className="min-h-[300px]">
        {step === 0 && <StepCreateApp onNext={() => goNext("create_app")} />}
        {step === 1 && (
          <StepGuildId
            value={form.guild_id}
            onChange={(v) => setForm(f => ({ ...f, guild_id: v }))}
            onNext={() => goNext("guild_id")}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepRoleId
            value={form.role_id}
            onChange={(v) => setForm(f => ({ ...f, role_id: v }))}
            onNext={() => goNext("role_id")}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepBotToken
            value={form.bot_token}
            onChange={(v) => { setForm(f => ({ ...f, bot_token: v })); setValidationResult(null); }}
            onNext={() => goNext("bot_token")}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepValidate
            form={form}
            onValidate={handleValidate}
            validationResult={validationResult}
            validating={validating}
            onBack={() => setStep(3)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>

      {onCancel && (
        <button onClick={onCancel} className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Cancel setup
        </button>
      )}
    </div>
  );
}