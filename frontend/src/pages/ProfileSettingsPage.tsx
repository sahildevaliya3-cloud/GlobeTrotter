import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import {
  deleteUserAccount,
  getUserProfile,
  updateUserProfile,
} from "../lib/api";

const LANGUAGES = [
  { code: "en", label: "English (US)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ja", label: "Japanese (日本語)" },
];

export function ProfileSettingsPage() {
  const { token, user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? user?.photo_url ?? "");
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    getUserProfile(token)
      .then((res) => {
        if (res.user) {
          setName(res.user.name ?? "");
          setPhotoUrl(res.user.photoUrl ?? res.user.photo_url ?? "");
          setLanguage(res.user.language ?? "en");
          updateUser(res.user);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await updateUserProfile(token, {
        name: name.trim(),
        photo_url: photoUrl.trim() || null,
        language,
      });

      updateUser(res.user);
      setSuccessMsg("Profile settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update profile settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDeleteAccount() {
    if (!token) return;
    if (confirmInput.trim() !== "DELETE") {
      setDeleteError("Please type DELETE exactly to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteUserAccount(token);
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account."
      );
      setDeleting(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Account Management
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
            Profile & Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your personal preferences, profile details, and account security.
          </p>
        </div>

        {successMsg ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in duration-200">
            ✓ {successMsg}
          </div>
        ) : null}

        {errorMsg ? (
          <div role="alert" className="rounded-2xl border border-[#fecdca] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">
            {errorMsg}
          </div>
        ) : null}

        {/* Profile Details Form Card */}
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-[var(--ink)]">Profile Details</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Update your public display name and avatar photo.
          </p>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
            {/* Avatar Preview & Photo URL */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--accent)] bg-slate-100 shadow-sm">
                {photoUrl.trim() ? (
                  <img
                    src={photoUrl.trim()}
                    alt={name || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    {(name || user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Avatar Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input-base text-sm"
                />
                <p className="text-[11px] text-[var(--muted)]">
                  Enter an image web address to display your avatar photo.
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 input-base text-sm font-semibold"
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Email Address
              </label>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2">
                <span className="text-sm font-medium text-[var(--muted)]">
                  {user?.email}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                  🔒 Primary Email
                </span>
              </div>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Language Preference
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 input-base text-sm font-semibold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--line)]">
              <button
                type="submit"
                disabled={saving || fetching}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone — Account Deletion */}
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Danger Zone</h3>
              <p className="mt-1 text-xs text-red-700">
                Permanently delete your account, saved trips, itineraries, and assigned activities. This action cannot be reversed.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConfirmInput("");
                setDeleteError(null);
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <header className="border-b border-red-100 bg-red-50 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                Warning — Permanent Action
              </span>
              <h3 className="text-lg font-bold text-red-900">Delete Account</h3>
            </header>

            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--ink)]">
                Are you strictly sure you want to delete your account? All your trips and itineraries will be permanently deleted immediately.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  To confirm, type <span className="font-mono text-red-600 font-extrabold">DELETE</span> below:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-red-300 bg-white px-3.5 py-2 text-sm font-bold font-mono text-[var(--ink)] focus:border-red-600 focus:outline-none"
                />
              </div>

              {deleteError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {deleteError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteAccount}
                  disabled={confirmInput.trim() !== "DELETE" || deleting}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting Account…" : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
