// 클라이언트 사이드 콘텐츠 모더레이션
// 3단계: blocked (차단) / pending (관리자 승인) / approved (바로 게시)

// 차단 대상 (BLOCKED) — 제출 자체 불가
const BLOCKED_PATTERNS = [
  // 욕설 / 비속어
  /시발|씨발|ㅅㅂ|ㅆㅂ|십새|씹새|씹창|ㅅㅋ|개새|ㄱㅅ|개쌔|개놈|개년/,
  /병신|ㅂㅅ|븅신|빙신|븅딱|병딱/,
  /지랄|ㅈㄹ|조까|ㅈㄲ|존나|졸라|ㅈㄴ|쳐먹|처먹|쳐발|처발/,
  /닥쳐|꺼져|엿먹|엿처|좆|좇|좃|ㅈ같|존같|좆같|좇같/,
  /미친놈|미친년|미친새|또라이|돌+은?년|돌+은?놈/,
  /새끼야|년아|년들/,
  /fuck|shit|bitch|asshole|bastard|dick|pussy|cunt/i,

  // 19금 / 성적 콘텐츠
  /섹스|성교|성관계|자위|딸치|딸딸이|야동|야사|야덜|포르노|야한짓/,
  /자지|보지|씹|음경|음순|음모|고자|보털|자털|고환|페니스|바기나/,
  /쓰리썸|스와핑|몰카|불륜|원나잇|떡치|떡침|원나잇|ㅆㅅㅌㅊ/,
  /오입|창녀|창년|걸레|갈보|기생|창부/,

  // 혐오 표현 (성별, 세대, 지역 등)
  /틀딱|틀니딱딱|한남충|한남|한녀충|김치녀|김치남|맘충|급식충|꼰대충/,
  /조선족|짱깨|쪽발이|흑형|흑누나|토착왜구|좌빨|수꼴/,

  // 극단적 폭력 암시
  /죽여|죽인다|죽여버|죽일놈|죽일년|뒤져라|뒈져|살인|찔러/,
];

// 관리자 승인 필요 (PENDING) — 강한 비판 / 부정적
const PENDING_PATTERNS = [
  // 강한 인신공격
  /바보|멍청|무능|쓰레기(?!통)|사기꾼|도둑놈|도둑년|나쁜놈|나쁜년/,
  // 과도한 정치 공격
  /탄핵|파면|구속하라|사퇴하라|물러나라|내려와라|퇴진하라/,
  // 부정적 단정
  /최악|끔찍|혐오|역겨|꼴보기|짜증나|개판|엉망/,
  // 비꼬는 표현
  /뻔뻔|파렴치|양심없|양심불량|거짓말쟁이/,
];

export type ModerationResult = 'approved' | 'pending' | 'blocked';

export function moderateContent(text: string): ModerationResult {
  const normalized = text.toLowerCase().replace(/\s+/g, '');

  // 1단계: 완전 차단 단어 체크
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return 'blocked';
    }
  }

  // 2단계: 관리자 승인 필요 단어 체크
  for (const pattern of PENDING_PATTERNS) {
    if (pattern.test(normalized)) {
      return 'pending';
    }
  }

  return 'approved';
}
