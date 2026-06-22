"use client";
import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Globe,
  Shield,
  Sliders,
  Database,
  Download,
  Loader2,
  CheckCircle2,
  Save,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${enabled ? "bg-[#1A7A4A]" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SettingsCard({ title, icon: Icon, children, onSave, saving, saved }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-[#1A7A4A]" />
        </div>
        <p className="font-bold text-gray-900 text-sm">{title}</p>
      </div>
      <div className="space-y-4 flex-1">{children}</div>
      {onSave && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#15633C] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      )}
    </div>
  );
}

function FieldLabel({ label, sub }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1A7A4A] transition-colors bg-gray-50"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1A7A4A] transition-colors bg-gray-50"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function ToggleRow({ label, sub, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <FieldLabel label={label} sub={sub} />
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${checked ? "bg-[#1A7A4A] border-[#1A7A4A]" : "border-gray-300 bg-white"}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function useSaveState() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (fn) => {
    setSaving(true);
    setSaved(false);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return { saving, saved, save };
}

export default function SettingsPage() {
  // General
  const [platformName, setPlatformName] = useState("MamaCare");
  const [adminEmail, setAdminEmail] = useState("admin@mamacare.com");
  const [timezone, setTimezone] = useState("(GMT+01:00) West Africa Time");
  const [dateFormat, setDateFormat] = useState("MMM DD, YYYY");
  const generalSave = useSaveState();

  // Notifications
  const [notifNewUser, setNotifNewUser] = useState(true);
  const [notifAppointment, setNotifAppointment] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const notifSave = useSaveState();

  // Language
  const [defaultLang, setDefaultLang] = useState("English");
  const [langEnglish, setLangEnglish] = useState(true);
  const [langYoruba, setLangYoruba] = useState(true);
  const [langHausa, setLangHausa] = useState(true);
  const [langIgbo, setLangIgbo] = useState(true);
  const [langPidgin, setLangPidgin] = useState(false);
  const langSave = useSaveState();

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const securitySave = useSaveState();

  // Platform
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const platformSave = useSaveState();

  // Backup
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [backupStatus, setBackupStatus] = useState("—");
  const [lastBackup, setLastBackup] = useState("—");
  const backupSave = useSaveState();

  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    if (!token) { setLoadingSettings(false); return; }

    fetch(`${BASE_URL}/api/v1/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.platformName) setPlatformName(data.platformName);
        if (data.adminEmail) setAdminEmail(data.adminEmail);
        if (data.timezone) setTimezone(data.timezone);
        if (data.dateFormat) setDateFormat(data.dateFormat);
        if (data.notifications) {
          const n = data.notifications;
          if (n.newUserRegistration !== undefined) setNotifNewUser(n.newUserRegistration);
          if (n.appointmentBooked !== undefined) setNotifAppointment(n.appointmentBooked);
          if (n.reminderAlerts !== undefined) setNotifReminder(n.reminderAlerts);
          if (n.communityReports !== undefined) setNotifCommunity(n.communityReports);
          if (n.systemAlerts !== undefined) setNotifSystem(n.systemAlerts);
          if (n.weeklySummary !== undefined) setNotifWeekly(n.weeklySummary);
        }
        if (data.defaultLanguage) setDefaultLang(data.defaultLanguage);
        if (data.supportedLanguages) {
          const l = data.supportedLanguages;
          if (l.English !== undefined) setLangEnglish(l.English);
          if (l.Yoruba !== undefined) setLangYoruba(l.Yoruba);
          if (l.Hausa !== undefined) setLangHausa(l.Hausa);
          if (l.Igbo !== undefined) setLangIgbo(l.Igbo);
          if (l.Pidgin !== undefined) setLangPidgin(l.Pidgin);
        }
        if (data.security) {
          const s = data.security;
          if (s.twoFactorAuth !== undefined) setTwoFactor(s.twoFactorAuth);
          if (s.loginAlerts !== undefined) setLoginAlerts(s.loginAlerts);
          if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
        }
        if (data.platform) {
          const p = data.platform;
          if (p.maintenanceMode !== undefined) setMaintenanceMode(p.maintenanceMode);
          if (p.allowUserRegistration !== undefined) setAllowRegistration(p.allowUserRegistration);
          if (p.emailVerification !== undefined) setEmailVerification(p.emailVerification);
        }
        if (data.backup) {
          const b = data.backup;
          if (b.frequency) setBackupFrequency(b.frequency);
          if (b.lastBackup) setLastBackup(b.lastBackup);
          if (b.status) setBackupStatus(b.status);
        }
      })
      .catch(() => {/* use defaults silently */})
      .finally(() => setLoadingSettings(false));
  }, []);

  const patchSettings = async (payload) => {
    const token = localStorage.getItem("mc_token");
    if (!token) return;
    await fetch(`${BASE_URL}/api/v1/admin/settings`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return (
    <div className="space-y-5">
      {loadingSettings && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <Loader2 size={14} className="animate-spin text-[#1A7A4A]" />
          Loading settings...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* General */}
        <SettingsCard
          title="General Settings"
          icon={Settings}
          saving={generalSave.saving}
          saved={generalSave.saved}
          onSave={() => generalSave.save(() => patchSettings({ platformName, adminEmail, timezone, dateFormat }))}
        >
          <div className="space-y-1">
            <FieldLabel label="Platform Name" />
            <TextInput value={platformName} onChange={setPlatformName} placeholder="MamaCare" />
          </div>
          <div className="space-y-1">
            <FieldLabel label="Admin Email" />
            <TextInput value={adminEmail} onChange={setAdminEmail} placeholder="admin@mamacare.com" />
          </div>
          <div className="space-y-1">
            <FieldLabel label="Timezone" />
            <SelectInput value={timezone} onChange={setTimezone} options={[
              "(GMT+01:00) West Africa Time",
              "(GMT+00:00) UTC",
              "(GMT+02:00) Central Africa Time",
              "(GMT-05:00) Eastern Time",
            ]} />
          </div>
          <div className="space-y-1">
            <FieldLabel label="Date Format" />
            <SelectInput value={dateFormat} onChange={setDateFormat} options={["MMM DD, YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard
          title="Notification Settings"
          icon={Bell}
          saving={notifSave.saving}
          saved={notifSave.saved}
          onSave={() => notifSave.save(() => patchSettings({
            notifications: {
              newUserRegistration: notifNewUser,
              appointmentBooked: notifAppointment,
              reminderAlerts: notifReminder,
              communityReports: notifCommunity,
              systemAlerts: notifSystem,
              weeklySummary: notifWeekly,
            },
          }))}
        >
          <ToggleRow label="New User Registration" enabled={notifNewUser} onChange={setNotifNewUser} />
          <ToggleRow label="Appointment Booked" enabled={notifAppointment} onChange={setNotifAppointment} />
          <ToggleRow label="Reminder Alerts" enabled={notifReminder} onChange={setNotifReminder} />
          <ToggleRow label="Community Reports" enabled={notifCommunity} onChange={setNotifCommunity} />
          <ToggleRow label="System Alerts" enabled={notifSystem} onChange={setNotifSystem} />
          <ToggleRow label="Weekly Summary" enabled={notifWeekly} onChange={setNotifWeekly} />
        </SettingsCard>

        {/* Language */}
        <SettingsCard
          title="Language Settings"
          icon={Globe}
          saving={langSave.saving}
          saved={langSave.saved}
          onSave={() => langSave.save(() => patchSettings({
            defaultLanguage: defaultLang,
            supportedLanguages: { English: langEnglish, Yoruba: langYoruba, Hausa: langHausa, Igbo: langIgbo, Pidgin: langPidgin },
          }))}
        >
          <div className="space-y-1">
            <FieldLabel label="Default Language" />
            <SelectInput value={defaultLang} onChange={setDefaultLang} options={["English", "Yoruba", "Hausa", "Igbo", "Pidgin"]} />
          </div>
          <div className="space-y-2">
            <FieldLabel label="Supported Languages" />
            <CheckboxRow label="English" checked={langEnglish} onChange={setLangEnglish} />
            <CheckboxRow label="Yoruba" checked={langYoruba} onChange={setLangYoruba} />
            <CheckboxRow label="Hausa" checked={langHausa} onChange={setLangHausa} />
            <CheckboxRow label="Igbo" checked={langIgbo} onChange={setLangIgbo} />
            <CheckboxRow label="Pidgin" checked={langPidgin} onChange={setLangPidgin} />
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard
          title="Security Settings"
          icon={Shield}
          saving={securitySave.saving}
          saved={securitySave.saved}
          onSave={() => securitySave.save(() => patchSettings({
            security: { twoFactorAuth: twoFactor, loginAlerts, sessionTimeout },
          }))}
        >
          <ToggleRow label="Two-Factor Authentication" sub="Add extra security to your admin account" enabled={twoFactor} onChange={setTwoFactor} />
          <ToggleRow label="Login Alerts" sub="Get notified of new login attempts" enabled={loginAlerts} onChange={setLoginAlerts} />
          <div className="space-y-1">
            <FieldLabel label="Session Timeout" sub="Automatically log out inactive sessions." />
            <SelectInput value={sessionTimeout} onChange={setSessionTimeout} options={["15 minutes", "30 minutes", "1 hour", "4 hours", "Never"]} />
          </div>
        </SettingsCard>

        {/* Platform */}
        <SettingsCard
          title="Platform Settings"
          icon={Sliders}
          saving={platformSave.saving}
          saved={platformSave.saved}
          onSave={() => platformSave.save(() => patchSettings({
            platform: { maintenanceMode, allowUserRegistration: allowRegistration, emailVerification },
          }))}
        >
          <ToggleRow label="Maintenance Mode" sub="Temporarily disable access to the platform." enabled={maintenanceMode} onChange={setMaintenanceMode} />
          <ToggleRow label="Allow User Registration" sub="Allow new users to sign up" enabled={allowRegistration} onChange={setAllowRegistration} />
          <ToggleRow label="Email Verification" sub="Require email verification for new users" enabled={emailVerification} onChange={setEmailVerification} />
        </SettingsCard>

        {/* Data & Backup */}
        <SettingsCard
          title="Data & Backup"
          icon={Database}
          saving={backupSave.saving}
          saved={backupSave.saved}
          onSave={() => backupSave.save(() => patchSettings({ backup: { frequency: backupFrequency } }))}
        >
          <div className="space-y-1">
            <FieldLabel label="Backup Frequency" />
            <SelectInput value={backupFrequency} onChange={setBackupFrequency} options={["Hourly", "Daily", "Weekly", "Monthly"]} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Last Backup</p>
            <p className="text-sm font-semibold text-gray-800">{lastBackup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Backup Status</p>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              backupStatus === "Completed" ? "bg-[#E8F5EE] text-[#1A7A4A]"
              : backupStatus === "In Progress" ? "bg-yellow-50 text-yellow-700"
              : "bg-gray-100 text-gray-500"
            }`}>
              {backupStatus}
            </span>
          </div>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-[#1A7A4A] text-[#1A7A4A] text-sm font-semibold hover:bg-[#E8F5EE] transition-colors">
            <Download size={14} />
            Download Backup
          </button>
        </SettingsCard>

      </div>
    </div>
  );
}