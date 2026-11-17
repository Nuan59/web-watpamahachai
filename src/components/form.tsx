"use client";
import { createContext, useContext, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

const Pending = createContext(false);

/** Submit button that disables itself while the form is being sent. */
export function Submit({ children, className = "btn btn-primary", pendingText, name, value }: { children: React.ReactNode; className?: string; pendingText?: string; name?: string; value?: string }) {
  const status = useFormStatus();
  const pending = useContext(Pending) || status.pending;
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} name={name} value={value}>
      {pending ? pendingText ?? "กำลังบันทึก…" : children}
    </button>
  );
}

/** Submit button that asks first (for deletes). */
export function ConfirmSubmit({ children, message, className = "btn btn-sm btn-danger" }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

export type SaveResult = { error?: string } | void;

/**
 * Form for long content (news, events, pages). On an error the action returns { error } and nothing
 * the person typed is lost: we call the action ourselves instead of <form action>, which React resets.
 * On success the action redirects.
 */
export function ActionForm({ action, children, className }: { action: (f: FormData) => Promise<SaveResult>; children: React.ReactNode; className?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <Pending.Provider value={pending}>
      {error && <p role="alert" className="mb-4 rounded-md border border-bad/40 bg-white px-3 py-2 text-sm text-bad">{error}</p>}
      <form
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const r = await action(fd);
            if (r && r.error) { setError(r.error); window.scrollTo({ top: 0, behavior: "smooth" }); }
          });
        }}
      >
        {children}
      </form>
    </Pending.Provider>
  );
}
