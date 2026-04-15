export async function shareToKakao(title: string, description: string, imageUrl: string, link: string) {
  if (typeof window === 'undefined') return;

  const Kakao = (window as unknown as { Kakao?: { isInitialized: () => boolean; init: (key: string) => void; Share: { sendDefault: (options: unknown) => void } } }).Kakao;
  if (!Kakao) return;

  if (!Kakao.isInitialized()) {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY;
    if (kakaoKey) Kakao.init(kakaoKey);
  }

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: link, webUrl: link },
    },
    buttons: [
      { title: '자세히 보기', link: { mobileWebUrl: link, webUrl: link } },
    ],
  });
}

export async function shareNative(title: string, text: string, url: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title, text, url });
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
