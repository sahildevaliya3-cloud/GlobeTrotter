import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const inputClassName = "input-base";

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ id, label, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

type TextInputProps = {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">;

export function TextInput({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
  ...props
}: TextInputProps) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
        {...props}
      />
    </FormField>
  );
}

type TextAreaProps = {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "value" | "onChange">;

export function TextArea({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} resize-y`}
        {...props}
      />
    </FormField>
  );
}

export function CoverPreview({ url }: { url: string }) {
  if (!url.trim()) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)]">
      <img
        src={url}
        alt="Cover preview"
        className="h-40 w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
