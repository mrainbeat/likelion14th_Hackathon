const MOCK_QUESTIONS = [
  "하루가 금방 지나간 게 아쉽다고 느낀 건, 어떤 순간을 조금 더 오래 보내고 싶어서였을까요?",
  "오늘 마음이 편해졌던 순간이 있다면 언제였나요?",
  "요즘 자꾸 신경 쓰이는 게 있다면 뭔가요?",
];

export function fetchReflectionQuestion({ useDiaryContent } = {}) {
  const question =
    MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ question });
    }, 1500);
  });
}
