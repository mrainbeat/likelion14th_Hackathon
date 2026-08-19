export const homeSessionFlags = {
  resumeChecked: false,
  weeklyNotifyChecked: false,
};

export function resetHomeSessionFlags() {
  homeSessionFlags.resumeChecked = false;
  homeSessionFlags.weeklyNotifyChecked = false;
}
