"use client";

import { useEffect, useState } from "react";

export default function NewsNotificationPrompt() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <strong>Stay in the loop.</strong> Turn on browser notifications to
          catch new industry updates as soon as they drop.
        </div>
        <button
          type="button"
          className="self-start rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={requestPermission}
          disabled={permission === "granted"}
        >
          {permission === "granted"
            ? "Notifications enabled"
            : "Enable notifications"}
        </button>
      </div>
      {permission === "denied" && (
        <p className="mt-2 text-xs">
          Notifications are blocked for this site. Update your browser settings
          if you change your mind.
        </p>
      )}
    </div>
  );
}
