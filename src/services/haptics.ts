import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const hapticLight = () =>
  ReactNativeHapticFeedback.trigger("impactLight", options);

export const hapticMedium = () =>
  ReactNativeHapticFeedback.trigger("impactMedium", options);

export const hapticSelection = () =>
  ReactNativeHapticFeedback.trigger("selection", options);

export const hapticSuccess = () =>
  ReactNativeHapticFeedback.trigger("notificationSuccess", options);

export const hapticWarning = () =>
  ReactNativeHapticFeedback.trigger("notificationWarning", options);

export const hapticError = () =>
  ReactNativeHapticFeedback.trigger("notificationError", options);