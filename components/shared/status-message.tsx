type StatusMessageProps = {
  success?: boolean;
  message?: string;
};

export function StatusMessage({ success, message }: StatusMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`rounded-xl px-3 py-2 text-sm ${
        success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}
