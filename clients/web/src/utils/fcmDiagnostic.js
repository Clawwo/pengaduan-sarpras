/**
 * FCM Diagnostic Tool
 * Gunakan untuk troubleshoot masalah FCM
 */

export const runFCMDiagnostic = async () => {
  console.log("🔍 =================================");
  console.log("🔍 FCM DIAGNOSTIC TOOL");
  console.log("🔍 =================================");

  const results = {
    browser: checkBrowserSupport(),
    serviceWorker: checkServiceWorkerSupport(),
    notification: await checkNotificationPermission(),
    firebase: checkFirebaseConfig(),
    network: await checkNetworkConnectivity(),
  };

  console.log("\n📊 DIAGNOSTIC RESULTS:");
  console.table(results);

  const allPassed = Object.values(results).every((r) => r.status === "✅");

  if (allPassed) {
    console.log("\n✅ All checks passed! FCM should work.");
  } else {
    console.log("\n❌ Some checks failed. See details above.");
    provideSolutions(results);
  }

  console.log("🔍 =================================\n");

  return results;
};

function checkBrowserSupport() {
  const hasNotification = "Notification" in window;
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasPushManager = "PushManager" in window;

  const passed = hasNotification && hasServiceWorker && hasPushManager;

  return {
    status: passed ? "✅" : "❌",
    notification: hasNotification ? "✅" : "❌",
    serviceWorker: hasServiceWorker ? "✅" : "❌",
    pushManager: hasPushManager ? "✅" : "❌",
  };
}

function checkServiceWorkerSupport() {
  if (!("serviceWorker" in navigator)) {
    return { status: "❌", message: "Service Worker not supported" };
  }

  return { status: "✅", message: "Service Worker supported" };
}

async function checkNotificationPermission() {
  if (!("Notification" in window)) {
    return { status: "❌", permission: "not_supported" };
  }

  const permission = Notification.permission;

  return {
    status:
      permission === "granted" ? "✅" : permission === "denied" ? "❌" : "⚠️",
    permission: permission,
  };
}

function checkFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  };

  const allPresent = Object.values(config).every((v) => v && v.length > 0);

  return {
    status: allPresent ? "✅" : "❌",
    apiKey: config.apiKey ? "✅" : "❌",
    projectId: config.projectId || "missing",
    vapidKey: config.vapidKey ? `✅ (${config.vapidKey.length} chars)` : "❌",
  };
}

async function checkNetworkConnectivity() {
  try {
    // Try to reach Firebase
    // eslint-disable-next-line no-unused-vars
    const response = await fetch("https://fcm.googleapis.com/", {
      method: "HEAD",
      mode: "no-cors",
    });

    return {
      status: "✅",
      message: "Firebase reachable",
    };
  } catch (error) {
    return {
      status: "❌",
      message: "Cannot reach Firebase",
      error: error.message,
    };
  }
}

function provideSolutions(results) {
  console.log("\n💡 SOLUTIONS:");

  if (results.browser.status === "❌") {
    console.log("❌ Browser Support Issue:");
    console.log("   → Use modern browser (Chrome, Firefox, Edge)");
    console.log("   → Update your browser to latest version");
  }

  if (results.notification.status === "❌") {
    console.log("❌ Notification Permission Denied:");
    console.log("   → Go to browser settings");
    console.log("   → Allow notifications for this site");
    console.log("   → Or use incognito/private mode to reset");
  }

  if (results.notification.status === "⚠️") {
    console.log("⚠️ Notification Permission Not Granted:");
    console.log("   → Click 'Allow' when prompted");
    console.log("   → Or click notification banner in app");
  }

  if (results.firebase.status === "❌") {
    console.log("❌ Firebase Config Missing:");
    console.log("   → Check .env file");
    console.log("   → Make sure all VITE_FIREBASE_* variables are set");
    console.log("   → Restart dev server after editing .env");
  }

  if (results.network.status === "❌") {
    console.log("❌ Network Issue:");
    console.log("   → Check internet connection");
    console.log("   → Check firewall/proxy settings");
    console.log("   → Make sure Firebase is not blocked");
  }
}

// Make it available globally for easy console access
if (typeof window !== "undefined") {
  window.runFCMDiagnostic = runFCMDiagnostic;
}
