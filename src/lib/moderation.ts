// 클라이언트 사이드 콘텐츠 모더레이션
// GitHub Pages (정적 배포) 환경에서 동작하는 키워드 기반 필터링

const NEGATIVE_PATTERNS = [
  // 인신공격/비방
  /바보|멍청|무능|쓰레기|사기꾼|도둑놈|나쁜놈/,
  // 욕설
  /시발|씨발|ㅅㅂ|ㅆㅂ|개새끼|ㄱㅅㄲ|병신|ㅂㅅ|지랄|ㅈㄹ|꺼져|닥쳐/,
  // 혐오 표현
  /틀딱|한남|한녀|맘충|급식충/,
  // 과도한 정치 공격
  /탄핵|파면|구속|사퇴하|물러나|내려와/,
];

export function moderateContent(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, '');

  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(normalized)) {
      return false; // pending 처리
    }
  }

  return true; // approved
}
