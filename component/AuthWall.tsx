import Link from "next/link";

type AuthWallProps = {
  title?: string;
  message?: string;
};

export default function AuthWall({
  title = "Sign in required",
  message = "Please sign in to access this feature.",
}: AuthWallProps) {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-amber-900">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/auth"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
          >
            Go to sign in
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
