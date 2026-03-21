import { TOAST_EVENT, type ToastType } from ".";

export function toast(message: string, type: ToastType = "info") {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: { message, type, id: Math.random().toString(36).substring(2, 9) },
  });
  window.dispatchEvent(event);
}
