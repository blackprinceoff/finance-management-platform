interface ErrorBannerProps {
  message: string | null;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl bg-red-50 px-5 py-4">
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}
