import { NextRequest, NextResponse } from 'next/server';
import { submitSuggestion } from '@/lib/suggestions';
import type { SuggestionFormData } from '@/types/suggestion';

async function moderateContent(text: string): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // API 키 없으면 자동 승인
    return true;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `당신은 한국 지방자치단체 정책 제안 플랫폼의 콘텐츠 모더레이터입니다.
아래 정책 제안 텍스트를 검토하고, 다음 기준에 해당하면 "REJECT"를, 정상이면 "APPROVE"를 응답하세요.

거부 기준:
- 특정 인물에 대한 인신공격, 비방, 명예훼손
- 과도하게 부정적이거나 비판만을 위한 비판 (건설적이지 않은 비난)
- 욕설, 혐오 표현, 차별적 발언
- 허위 사실 유포로 보이는 내용
- 정책과 무관한 정치 공격성 발언

승인 기준:
- 건설적인 비판과 대안 제시는 허용
- 현재 정책의 문제점 지적 + 개선안은 허용
- 주민의 솔직한 불편사항 호소는 허용

텍스트:
"""
${text}
"""

APPROVE 또는 REJECT 중 하나만 응답하세요.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      // API 실패 시 자동 승인
      return true;
    }

    const result = await response.json();
    const answer = result.content?.[0]?.text?.trim().toUpperCase() || '';
    return answer.includes('APPROVE');
  } catch {
    // 에러 시 자동 승인
    return true;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestionFormData = await request.json();

    // 필수 필드 검증
    if (!body.title || !body.content || !body.nickname || !body.region || !body.category) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 제목 + 내용 + 이유를 합쳐서 모더레이션
    const fullText = [body.title, body.content, body.reason, body.expectedEffect]
      .filter(Boolean)
      .join('\n');

    const isApproved = await moderateContent(fullText);
    const status = isApproved ? 'approved' : 'pending';

    const id = await submitSuggestion(body, status);

    if (!id) {
      return NextResponse.json(
        { error: 'Firebase가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id,
      status,
      message: isApproved
        ? '정책 제안이 등록되었습니다!'
        : '제안이 접수되었습니다. 검토 후 게시됩니다.',
    });
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
