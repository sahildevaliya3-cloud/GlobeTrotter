type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(19,34,56,0.45)] px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(19,34,56,0.18)]"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-[var(--ink)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#912018] disabled:opacity-60"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
