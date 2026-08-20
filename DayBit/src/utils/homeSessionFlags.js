export const homeSessionFlags = {
  resumeChecked: false,
  weeklyNotifyChecked: false,
  writtenTodayChecked: false,
};

export function resetHomeSessionFlags() {
  homeSessionFlags.resumeChecked = false;
  homeSessionFlags.weeklyNotifyChecked = false;
  homeSessionFlags.writtenTodayChecked = false;
}
