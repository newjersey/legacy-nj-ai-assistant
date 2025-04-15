declare global {
  interface Window {
    dataLayer: Array<object>;
  }
}

export function logEvent(eventName: string, extraParameters: object) {
  if (window.dataLayer != null) {
    const finalEventName =
      window.location.hostname === "localhost" ? `test_${eventName}` : eventName;
    window.dataLayer.push({ event: finalEventName, ...extraParameters });
  } else {
    // eslint-disable-next-line no-console
    console.log("In production, the following event would be logged to Google Analytics:", {
      eventName,
      extraParameters,
    });
  }
}
