import apiClient from "../api/apiClient";

let inFlight = null;

export function fetchMe() {
  if (!inFlight) {
    inFlight = apiClient.get("/api/me").finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
