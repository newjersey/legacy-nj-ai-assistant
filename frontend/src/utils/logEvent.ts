declare global {
  interface Window {
    dataLayer: Array<object>;
  }
}

export function logEvent(eventName: string, extraParameters: object) {
  if (window.dataLayer != null) {
    window.dataLayer.push({ event: eventName, ...extraParameters });
  } else {
    // eslint-disable-next-line no-console
    console.log("In production, the following event would be logged to Google Analytics:", {
      eventName,
      extraParameters,
    });
  }
}
