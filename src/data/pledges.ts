import type { Suggestion } from '@/types/suggestion';
import type { CategoryKey, RegionKey } from './categories';

/**
 * 정명근 화성특례시민 제9기 공약 50선 (Ver.260507-1.0).
 *
 * 출처: (공약-5차) 화성시 9기 공약_50선_260507_ver.1.3.pdf
 * 제공된 공식 문서의 텍스트를 한 글자도 다르지 않게 그대로 옮김.
 *  - title          ← PDF '공약'
 *  - content        ← PDF '공약 세부내용'
 *  - reason(부제)    ← PDF '공약 설명'
 *  - expectedEffect ← PDF '예산(억)' (예: '비예산', '4 (4y 추산)', '1,700' 등 원문 그대로)
 *
 * 분야 매핑(PDF → 사이트 카테고리):
 *  AI→ai, 교육→education, 교통→traffic, 기본사회→basic, 복지→welfare,
 *  산업→economy, 문화→culture, 체육→sports, 행정→admin, 안전→safety
 *
 * 지역 매핑(PDF → 사이트 권역):
 *  공통→common, 만세→manse, 동탄→dongtan, 효행→hyohaeng, 병점→byeongjeom
 *
 * 권역별 분포: 공통 37 / 만세 5 / 동탄 6 / 효행 1 / 병점 1 = 50
 */

interface PledgeSeed {
  no: number;
  category: CategoryKey;
  region: RegionKey;
  title: string;
  content: string;
  caption: string; // 공약 설명 (한 줄 부제)
  budget: string; // 예산 원문 (예: '1,700', '비예산', '4 (4y 추산)')
}

const PLEDGE_SEEDS: PledgeSeed[] = [
  {
    no: 1, category: 'ai', region: 'common',
    title: '시민중심 AI 혁신학교 추진',
    content: '화성 AI 혁신 캠퍼스에서 기초부터 실전 프로젝트까지! 시민 누구나 AI 시대의 주인공으로 성장하고, 미래 기술을 선도하는 리더로 거듭나는 배움의 장을 엽니다.',
    caption: '미래를 만들어 가는, 화성 AI 혁신 캠퍼스',
    budget: '4 (4y 추산)',
  },
  {
    no: 2, category: 'ai', region: 'common',
    title: 'AI공무원 ‘코리봇’ 임용',
    content: '365일 24시간, 시민의 부름에 즉각 응답하는 AI 공무원 \'코리봇\'을 주요 부서에 채용합니다. 반복 업무를 혁신하여 행정은 더 정교해지고, 민원 처리는 더 쉽고 더 빨라집니다.',
    caption: '24시간 잠들지않는 화성 행정 및 민원, 코리봇 임용',
    budget: '8',
  },
  {
    no: 3, category: 'ai', region: 'common',
    title: '글로벌 AI EXPO 「MARS」 업그레이드',
    content: '화성을 세계가 주목하는 AI 산업의 중심지로! 글로벌 AI EXPO를 확대 개최하여 투자와 인재가 모여드는 대한민국 대표 AI 플랫폼이자 \'마스(MARS)\'의 도약을 실현합니다.',
    caption: 'AI의 미래를 화성에서 만나다, 화성 EXPO 「MARS」 확대',
    budget: '40',
  },
  {
    no: 4, category: 'ai', region: 'common',
    title: 'AI 데이터 센터 유치',
    content: '삼성전자·현대차 등 첨단 제조업 기반과 수도권 교통망을 갖춘 AI 산업 최적지입니다. 선제적으로 AI 데이터 센터 유치 기반을 마련하여 양질의 일자리와 세수를 확보하고 지역 디지털 경제를 활성화하겠습니다.',
    caption: 'AI 리딩 도시 인프라를 위한 AI 데이터 센터 유치',
    budget: '비예산',
  },
  {
    no: 5, category: 'education', region: 'common',
    title: '화성교육지원청 신설',
    content: '화성 교육의 완전한 독립! 인구 107만 특례시에 걸맞은 독자적인 교육 지원 체계를 구축하여, 우리 아이들에게 화성만의 색깔을 담은 최고의 교육 환경을 선물합니다.',
    caption: '화성형 교육의 실현, 화성 교육지원청 신설 추진',
    budget: '비예산',
  },
  {
    no: 6, category: 'education', region: 'common',
    title: '지역 도서관 추가 건립',
    content: '집 근처 어디서나 지식과 쉼을 누리는 문화 거점을 만듭니다. 화성 전역에 우리 동네 핫플 도서관을 확충하여 시민의 삶에 품격 있는 복합 문화가치를 채웁니다.',
    caption: '시민의 삶을 풍요롭게 미래를 여는 지식의 창',
    budget: '677 (일시적)',
  },
  {
    no: 7, category: 'education', region: 'common',
    title: '최고의 인재를 만드는 영재교육원 확대',
    content: '우리 아이의 잠재력을 세계 수준으로! 최첨단 인프라와 최고 수준의 커리큘럼을 갖춘 K-영재사관학교를 통해, 화성이 대한민국을 이끌어갈 미래 인재의 요람이 됩니다.',
    caption: '화성의 미래를 키우는 K-영재사관학교',
    budget: '10',
  },
  {
    no: 8, category: 'traffic', region: 'common',
    title: '30분 이동시대, 도로망 및 철도망 구축',
    content: '거점별 도로망 확충과 광역철도망 조기 착공으로 화성 전역 30분 생활권을 실현합니다. 막힘없는 교통 인프라로 시민의 소중한 시간을 더 가치 있게 지켜드리겠습니다.',
    caption: '사통팔달 화성, 어디든 30분이면 충분합니다',
    budget: '3,500',
  },
  {
    no: 9, category: 'traffic', region: 'common',
    title: '교통민원 신속기동단 도입',
    content: '출퇴근길 상습 정체와 불편한 신호 체계, 이제 신속기동단이 빠르게 해결합니다. 현장의 목소리를 듣고 신속하게 행동하는 TF팀이 화성의 도로 위 답답함을 시원하게 뚫어드립니다.',
    caption: '교통민원 신속기동단 도입',
    budget: '4',
  },
  {
    no: 10, category: 'traffic', region: 'common',
    title: '공항버스 노선 확충',
    content: '공항 가는 길, 이제 집 앞에서 편하게 시작하세요. 화성 지역 공항버스 노선을 추가하여, 시민의 여행길이 더욱 설레고 편리해지도록 만들겠습니다.',
    caption: '우리집 앞에서 바로 타는 공항버스 노선 확충',
    budget: '40',
  },
  {
    no: 11, category: 'traffic', region: 'manse',
    title: '서해-경부 연결 철도망 구축',
    content: '서해선과 경부선을 잇는 철도 연결선을 조기에 실현하여 화성의 교통 지도를 바꿉니다. 철도망 연결로 지역 경제에 활력을 불어넣고 수도권 접근성을 획기적으로 높이겠습니다.',
    caption: '서해안을 깨우는 서해-경부 연결선 조기 실현',
    budget: '비예산',
  },
  {
    no: 12, category: 'traffic', region: 'dongtan',
    title: '심야 자율주행 동탄순환버스 신규 도입',
    content: '늦은 귀갓길도 걱정 없는 첨단 교통 복지! 동탄역과 주요 거점을 잇는 자율주행 순환버스를 도입하여, 이동 편의와 미래형 교통 도시의 자부심을 드립니다.',
    caption: '심야 자율주행 순환버스 신규 도입',
    budget: '15',
  },
  {
    no: 13, category: 'traffic', region: 'common',
    title: '광역·시내·급행버스 확대',
    content: '버스 기다리는 시간은 줄이고 목적지 도착은 더 빠르게! 광역 및 시내, 급행버스(동-서 지역 연결 급행 포함) 노선을 획기적으로 확충하고 배차 간격을 단축하여, 매일 아침 시민의 출근길에 여유를 더하겠습니다.',
    caption: '기다림은 짧게 이동은 빠르게, 광역/시내/급행버스 확대',
    budget: '100',
  },
  {
    no: 14, category: 'traffic', region: 'common',
    title: '우리동네 공영주차장 추가 조성',
    content: '주차 공간을 찾아 헤매는 스트레스는 이제 그만! 구도심과 주거 밀집 지역에 스마트 공영주차장을 대폭 확충하여, 시민의 생활 편의를 높이고 쾌적한 도로 환경을 조성합니다.',
    caption: '빈자리 찾는 스트레스 제로 우리 동네 공영주차장 추가 조성',
    budget: '450',
  },
  {
    no: 15, category: 'traffic', region: 'dongtan',
    title: '신동-남사터널 건설(가칭)',
    content: '화성 동탄과 용인 남사를 직선으로 잇는 신동-남사터널을 건설합니다. 우회하던 출퇴근길을 획기적으로 단축하여 시민의 이동 효율을 극대화하고 지역 간 상생 발전을 이끌겠습니다.',
    caption: '돌아가지 마세요, 신동남사터널로 출‧퇴근 5분 완료',
    budget: '1,700',
  },
  {
    no: 16, category: 'traffic', region: 'dongtan',
    title: '화성~한강 자전거도로 연결',
    content: '동탄에서 한강까지 이어지는 환상적인 자전거길을 끊김 없이 연결합니다. 자연을 벗 삼아 달리는 자전거 도로망으로 시민의 여가 활동을 풍성하게 채우겠습니다.',
    caption: '화성에서 한강까지 한 번에 연결되는 자전거길',
    budget: '20',
  },
  {
    no: 17, category: 'traffic', region: 'dongtan',
    title: '신리 나들목(가칭) 개통 추진',
    content: '고속도로 진입을 위해 겪어야 했던 정체는 이제 끝납니다. 동탄2지구 전용 IC를 신설하여 수도권 제2순환고속도로/경부고속도로 접근성을 높이고, 막힘없는 도로 위에서 시민의 이동 편의를 증대하겠습니다.',
    caption: '수도권 제2순환/경부고속도로 연결 신리 나들목(가칭) 개통',
    budget: '1,400',
  },
  {
    no: 18, category: 'traffic', region: 'dongtan',
    title: '동탄 트램의 조속 착공과 정상개통',
    content: '화성의 새로운 랜드마크가 될 동탄 트램의 정상개통을 위해 모든 행정력을 집중합니다. 신속한 절차 이행으로 기다림은 끝내고, 친환경적이고 편리한 트램 시대를 앞당기겠습니다.',
    caption: '기다림은 끝났다, 동탄 트램 착공 및 정상개통',
    budget: '비예산',
  },
  {
    no: 19, category: 'traffic', region: 'common',
    title: '스쿨존 속도제한 탄력 운영',
    content: '아이들의 안전은 지키고 운전자의 편의는 높입니다. 심야나 주말 등 상황에 맞게 스쿨존 속도 제한을 탄력적으로 운영하여, 안전과 효율이 공존하는 합리적인 교통 환경을 만듭니다.',
    caption: '시간대별 맞춤형 속도, 스쿨존 교통흐름의 최적화',
    budget: '50',
  },
  {
    no: 20, category: 'traffic', region: 'manse',
    title: '새솔동~안산 연결도로 건설',
    content: '새솔동과 안산 사이의 병목 구간을 해소하고 연결 도로를 확장합니다. 두 도시 간의 거리를 5분으로 단축하여 생활권 통합을 가속화하고 시민의 일상적인 이동을 더 자유롭게 합니다.',
    caption: '새솔~안산 정체 해소를 위한, 연결도로 추가 건설',
    budget: '450',
  },
  {
    no: 21, category: 'basic', region: 'common',
    title: '공중화장실 생리대 배치',
    content: '여성의 건강권은 당연히 누려야 할 일상입니다. 공공장소에 무상 자판기를 설치하고 생리용품 보급을 확대하여, 누구나 걱정 없이 사용할 수 있도록 환경을 조성합니다.',
    caption: '여성 건강 기본권, 공중화장실 생리대 배치',
    budget: '8',
  },
  {
    no: 22, category: 'basic', region: 'common',
    title: '지역화폐 1조원 확대 발행',
    content: '발행 규모를 1조 원으로 키워 지역 경제의 선순환을 이끕니다. 시민은 가계 보탬이 되어 즐겁고 소상공인은 매출이 늘어 웃음 짓는, 활력이 넘치는 화성을 만들겠습니다.',
    caption: '쓰면 쓸수록 이득 지역화폐, 1조원 확대로 소상공인 웃음꽃',
    budget: '3,840',
  },
  {
    no: 23, category: 'basic', region: 'common',
    title: '사각지대 없는 그냥드림 먹거리 기본보장 실현',
    content: '먹거리 기본권 보장으로 복지 사각지대 없는 도시를 구현하겠습니다. 식료품 지원을 위기가구 발굴의 시작점으로 삼아, 단순 지원을 넘어 촘촘한 맞춤형 지원으로 이어지는 ‘밀착형 복지 체계’를 완성하겠습니다.',
    caption: '먹거리 ‘그냥드림’을 통한 복지 사각지대를 발굴 및 지원',
    budget: '10',
  },
  {
    no: 24, category: 'basic', region: 'common',
    title: '화성형 주민주도형 햇빛소득마을 확대',
    content: '주민이 직접 참여하는 태양광 발전으로 마을 수익을 만듭니다. 유휴 부지를 활용해 매달 꼬박꼬박 햇빛 소득이 발생하는 에너지 자립 마을 20곳 이상을 조성하여 시민의 노후를 더 든든하게 합니다.',
    caption: '우리마을 효자 태양광, 매월 꼬박꼬박 ‘햇빛소득’',
    budget: '비예산',
  },
  {
    no: 25, category: 'welfare', region: 'manse',
    title: '화성특례시 공공산후조리원 (서부) 건립',
    content: '서부권에 명품 공공산후조리원이 찾아옵니다. 합리적인 비용으로 프리미엄급 산후 케어를 제공하여, 산모와 아기 모두가 건강하고 행복하게 생애 첫 시작을 할 수 있도록 지원합니다.',
    caption: '아이의 첫것음이 엄마의 기쁨이 되는 공공산후조리원',
    budget: '155',
  },
  {
    no: 26, category: 'welfare', region: 'common',
    title: '화성시민 출산·신생아 든든 토탈케어 도입',
    content: '임신 전 과정인 난임 시술부터 시술비 지원은 물론, 분만부터 신생아 집중치료(NICU), 건강한 성장까지 24시간 원스톱으로 책임지는 화성형 모자 보건 의료 체계를 완성하여, 부모님이 안심하고 아이 낳는 기쁨을 오롯이 누릴 수 있는 \'아이 키우기 좋은 도시, 화성\'을 만들어가겠습니다.',
    caption: '간절한 기다림에서 안전한 출산까지, 임신·신생아 안심 토탈케어',
    budget: '1700',
  },
  {
    no: 27, category: 'welfare', region: 'common',
    title: '고도비만 치료지원',
    content: '개인의 의지만으로는 어려운 고도비만 치료, 이제 화성이 함께합니다. 치료비와 약제비 지원을 통해 시민의 건강 회복을 돕고, 비만으로 인한 사회적 소외 없이 당당하게 일상으로 복귀하도록 지원합니다.',
    caption: '고도비만 탈출, 화성시가 함께합니다.',
    budget: '30',
  },
  {
    no: 28, category: 'welfare', region: 'common',
    title: '정신건강 기본 검진제 도입',
    content: '우리 아이들의 마음 건강, 이제 전문가가 함께 살핍니다. 중학생부터 순차적으로 정신건강 검진을 확대하여 사춘기 고민을 조기에 발견하고, 밝고 건강하게 성장할 수 있는 안전망을 구축합니다.',
    caption: '우리아이 사춘기 고민, 정신건강 검진으로 미리 살핍니다.',
    budget: '4',
  },
  {
    no: 29, category: 'welfare', region: 'common',
    title: '구청별 통합돌봄센터 마련',
    content: '돌봄이 필요할 때 여기저기 찾아다닐 필요 없습니다. 구별 원스톱 통합돌봄센터에서 보건, 의료, 일상 서비스 등을 한 번에 맞춤형으로 지원 받을 수 있습니다.',
    caption: '가까운 구청에서, 온가족 안심돌봄을 지원합니다.',
    budget: '17',
  },
  {
    no: 30, category: 'welfare', region: 'byeongjeom',
    title: '복합문화 복지타운 건립',
    content: '서부지역 노인복지관 신축 및 장애인복지관을 추가 건립합니다. 전 세대가 함께 누리는 고품격 복지 서비스를 통해 모든 시민이 소외 없이 따뜻한 일상을 누리는 복지 화성을 실현하겠습니다.',
    caption: '모두가 따뜻한 복지를 누리는 복합문화 복지타운 건립',
    budget: '1,186',
  },
  {
    no: 31, category: 'welfare', region: 'dongtan',
    title: '동탄2 대학(종합)병원 조기 착공',
    content: '시민의 생명을 지키는 5분의 골든타임! 대형 대학병원의 조기 착공을 위해 모든 행정 지원을 아끼지 않겠습니다. 수준 높은 의료 서비스를 집 가까이에서 누리는 안심 의료 환경을 구축합니다.',
    caption: '생명을 살리는 골든타임, 동탄2 대학병원 조기 착공',
    budget: '비예산',
  },
  {
    no: 32, category: 'welfare', region: 'hyohaeng',
    title: '소아·청소년 특화병원 확대',
    content: '아이가 밤늦게 아파도 당황하지 마세요. 소아 전문 야간 진료 시스템인 \'달빛 어린이병원\'을 대폭 확충하고 지원을 강화하여, 부모님이 안심하고 아이가 건강하게 자라는 환경을 조성합니다.',
    caption: '밤늦게 아픈 우리 아이를 위한 달빛 어린이병원 확대',
    budget: '80',
  },
  {
    no: 33, category: 'welfare', region: 'manse',
    title: '농어촌 생활인프라 확대',
    content: '도시와 농촌의 격차 없는 균형 발전! 농어촌 지역에 하수도와 도시가스 배관망을 촘촘히 설치하여 소외된 지역 없이 화성 시민이라면 누구나 쾌적하고 편리한 생활 환경을 누리게 하겠습니다.',
    caption: '우리 마을이 좋아집니다, 농어촌 하수도, 도시가스 LPG 등 확대 보급',
    budget: '31',
  },
  {
    no: 34, category: 'welfare', region: 'common',
    title: '농촌인력 지원센터 신설',
    content: '농번기 일손 부족으로 시름하는 농가를 위해 화성시가 직접 나섭니다. 외국인 계절근로자 도입과 파견 시스템을 공공이 직접 관리하여, 농민들이 일손 걱정 없이 농사에만 전념할 수 있게 돕겠습니다.',
    caption: '일손 걱정 끝, 화성시가 직접 챙기는 농촌인력 지원',
    budget: '비예산',
  },
  {
    no: 35, category: 'welfare', region: 'common',
    title: '화성시민 가족 주치의 제도 도입',
    content: '우리 가족의 건강 히스토리를 꿰뚫는 전담 의사가 생깁니다. 동네 의원과의 협력을 통해 만성질환부터 맞춤형 건강관리까지 책임지는 주치의 제도로 107만 화성 시민의 건강을 평생 지키겠습니다.',
    caption: '107만 시민을 지키는 든든한 건강파트너, 화성 주치의 제도 확대',
    budget: '20',
  },
  {
    no: 36, category: 'welfare', region: 'common',
    title: '반려 동·식물 보건소 신설',
    content: '반려가족을 위한 공공 보건의료 서비스 제공합니다. 기존 동물 보건소를 확대하여 반려 식물 등을 위한 보건소를 추가하여 공공의료 서비스 영역으로 확대하고, 반려 동·식물의 건강권 보호와 체계적인 관리 체계 구축, 복지 체계로의 전환을 추구합니다.',
    caption: '반려동‧식물 케어, 화성이 덜어 드립니다',
    budget: '10',
  },
  {
    no: 37, category: 'economy', region: 'common',
    title: '지식산업 센터 업종 제한 완화',
    content: '지식산업센터의 낡은 규제를 과감히 풀고 다양한 업종이 입주할 수 있도록 개선합니다. 기업 간의 융합을 촉진하고 지역 경제의 빈틈을 채워 화성을 기업하기 가장 좋은 도시로 만듭니다.',
    caption: '규제를 풀어 지식산업센터 업종제한 완화',
    budget: '비예산',
  },
  {
    no: 38, category: 'economy', region: 'common',
    title: '인큐베이팅 창업 기업 육성',
    content: '창의적인 아이디어만 있다면 화성에서 성공할 수 있습니다. 유망 스타트업을 선정해 공간과 자금, 멘토링을 집중 지원하여 화성을 대한민국 스타트업의 새로운 심장으로 키우겠습니다.',
    caption: '아이디어가 성공이 되는 곳, 화성 창업 프로젝트',
    budget: '120',
  },
  {
    no: 39, category: 'economy', region: 'common',
    title: '보급형/구독형 스마트팜 보급',
    content: '농업인 비용 부담은 확 낮추고 최첨단 ICT 기반의 농업을 누립니다. 화성형 보급형 스마트팜 모델을 통해 농사일은 편리해지고 생산성은 극대화되는 \'똑똑한 농업 경영\' 시대를 열어 농민의 소득을 높이겠습니다.',
    caption: '농어업경영도 스마트한 보급형 스마트팜 시대 개막',
    budget: '40',
  },
  {
    no: 40, category: 'economy', region: 'common',
    title: '청년농업인 210억 펀드 조성',
    content: '자본 부족으로 꿈을 포기하는 일이 없도록 80억 원 규모의 전용 펀드를 조성합니다. 스마트 농업부터 가공·유통까지, 청년 농업인의 혁신적인 아이디어가 화성에서 성공의 결실을 맺도록 지원합니다.',
    caption: '청년농업인의 새로운 도전을 위한 210억 펀드 조성',
    budget: '80',
  },
  {
    no: 41, category: 'economy', region: 'common',
    title: 'AI기반 우주항공산업 클러스터 허브 조성',
    content: 'AI·데이터 중심 우주항공 다운스트림 산업 육성을 위한 클러스터 조성과 핵심 인프라 착공 및 글로벌 빅테크, 앵커기업 등 투자유치, 제조·양산 중심 산업구조 및 드론·AAM 실증 테스트베드 등을 조성하겠습니다.',
    caption: 'AI기반 우주항공산업 클러스터 허브 조성',
    budget: '10',
  },
  {
    no: 42, category: 'basic', region: 'common',
    title: '화성형 시민협치 “화성동행기구” (가칭) 신설',
    content: '시장 직속의 ‘화성동행기구(협치위원회)’(가치) 설치, 마을만들기, 공정무역, 매향리 조직, 시민운동활동가 둥과 화성시가 거버넌스를 구축하여 분야별로 정책제안기구를 설립하여 이들을 정책의 객체가 아닌 협치의 주체로 세우겠습니다',
    caption: '시민이 진짜 주인공! 정명근과 짝꿍되어 \'화성형 시민협치\' 완성!',
    budget: '2',
  },
  {
    no: 43, category: 'culture', region: 'manse',
    title: '화성경마공원 유치',
    content: '세계적 수준의 복합 레저 공간인 경마공원을 유치하여 서부권 관광의 핵심 거점으로 만듭니다. 막대한 세수 확보와 일자리 창출을 통해 화성 경제의 새로운 성장 동력을 확보하겠습니다.',
    caption: '말(馬)과 함께 뛰는 화성경제, 경마공원 유치로 완성',
    budget: '400',
  },
  {
    no: 44, category: 'culture', region: 'common',
    title: '황톳길 맨발 산책로 추가 조성',
    content: '도심 속 자연을 맨발로 느끼며 건강을 챙기세요. 주요 공원에 황톳길 산책로와 세척 시설, 야간 조명까지 갖춰 시민 누구나 언제든 편안하게 힐링하고 건강을 회복할 수 있는 쉼터를 조성합니다.',
    caption: '건강을 걷다, 우리 동네 힐링 황톳길 산책로 추가 조성',
    budget: '20',
  },
  {
    no: 45, category: 'culture', region: 'common',
    title: '화성형 문화자치제 도입',
    content: '구청별 시민협의체의 실질적 문화 예산 결정권을 보장하여, 공급자 중심의 행정에서 벗어나 시민 주도의 문화 주권 시대를 열겠습니다. 이를 통해 각 지역의 특색이 살아있는 다채롭고 차별화된 지역 문화를 육성하겠습니다.',
    caption: '내가 낸 세금, 우리 동네 문화 예산 사용 제도 도입',
    budget: '16',
  },
  {
    no: 46, category: 'sports', region: 'common',
    title: '화성 스포츠 콤플렉스 건립',
    content: '화성 시민의 건강한 삶과 체육인의 역동적인 활동을 지원하기 위해 화성시 곳곳에 미세먼지 없는 에어돔 경기장, 축구장, 클라이밍 경기장, 롤러경기장, 테니스장, 체육회관 등 스포츠 콤플렉스를 건립하겠습니다.',
    caption: '복합기능 스포츠 콤플렉스 조성',
    budget: '805',
  },
  {
    no: 47, category: 'sports', region: 'common',
    title: '권역별 패밀리풀 확대 조성',
    content: '멀리 갈 필요 없이 동네에서 즐기는 완벽한 여름휴가! 권역별로 가족 물놀이 시설과 휴게 공간이 어우러진 대규모 패밀리풀을 조성하여, 온 가족이 함께 행복한 추억을 만드는 화성을 만듭니다.',
    caption: '화성형 랜드마크 가족공원, 온 가족의 물놀이 천국',
    budget: '80',
  },
  {
    no: 48, category: 'sports', region: 'common',
    title: '파크골프장 확대',
    content: '어르신들의 활기찬 노후와 건강한 여가 생활을 위해 명품 파크골프장을 조성합니다. 긴 대기시간을 획기적으로 단축하여 실버 스포츠의 메카로서 삶의 활력을 더해 드리겠습니다.',
    caption: '대기시간, 확~줄이는 우리 동네 명품 파크골프장 추가 조성',
    budget: '71',
  },
  {
    no: 49, category: 'admin', region: 'common',
    title: '화성노동지청 유치 및 고용센터 확대',
    content: '노동 및 고용 관련 업무를 위해 수원시를 찾아야 했던 불편을 끝냅니다. 화성시만의 독자적인 노동지청과 고용센터를 유치하여 시민들에게 신속하고 전문적인 밀착 행정 서비스를 제공하겠습니다.',
    caption: '더 이상 수원까지 가지마세요! 화성노동지청/고용센터 유치',
    budget: '비예산',
  },
  {
    no: 50, category: 'safety', region: 'common',
    title: '어린이 보호구역 안전시설 강화',
    content: '화성시 전체 스쿨존 100% 안전시설 정비를 위해 노후 안전시설 교체 및 옐로카펫, 조명확충, 스마트 안전 시스템 등을 도입하겠습니다. 이를 통해 교통사고 50%이상 줄이고, 교통안전 체감 만족도를 확 높이겠습니다.',
    caption: '스쿨존 안전을 위해 다양한 안전시설 설치',
    budget: '40',
  },
];

// PDF 공개 시각 — 정명근 공약 50선 정식 발표 시점
const PUBLISH_TIMESTAMP = new Date('2026-05-21T00:00:00+09:00').getTime();

export const PLEDGES_FALLBACK: Suggestion[] = PLEDGE_SEEDS.map((seed) => ({
  id: `pledge-${String(seed.no).padStart(2, '0')}`,
  title: seed.title,
  content: seed.content,
  reason: seed.caption,
  expectedEffect: `예산: ${seed.budget}억`,
  nickname: '정명근',
  realName: '',
  phone: '',
  region: seed.region,
  category: seed.category,
  status: 'approved',
  createdAt: PUBLISH_TIMESTAMP,
  likes: 0,
  password: '',
  reports: 0,
}));

export function pledgesByRegion(region: RegionKey): Suggestion[] {
  return PLEDGES_FALLBACK.filter((p) => p.region === region);
}

/**
 * 권역별 공약 갯수 — PLEDGES_FALLBACK에서 자동 계산.
 */
export const PLEDGE_COUNT_BY_REGION: Record<RegionKey, number> = (() => {
  const counts = { common: 0, manse: 0, hyohaeng: 0, byeongjeom: 0, dongtan: 0 } as Record<RegionKey, number>;
  PLEDGES_FALLBACK.forEach((p) => {
    counts[p.region] = (counts[p.region] || 0) + 1;
  });
  return counts;
})();
