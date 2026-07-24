import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * `EXPO_PUBLIC_SENTRY_DSN` ayarlanmadıysa `init` hiç çağrılmaz; SDK
 * tamamen devre dışı kalır (geliştirme/test için güvenlidir).
 */
if (dsn) {
  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: 0,
  });
}

export { Sentry };
