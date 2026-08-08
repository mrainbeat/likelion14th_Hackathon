const MOCK_COLORS = ["#00DEAD", "#FF8A65", "#6C7BFF", "#FFC93C", "#FF6B9D"];

export function fetchTodayColor() {
  const color = MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ color });
    }, 1500);
  });
}
