import { Innertube, YTNodes } from 'youtubei.js';
import CouponClientUI from './CouponClientUI';

// 실시간 확인을 위해 캐시를 끄는 모드 유지
export const dynamic = 'force-dynamic'; 

const TARGETS = [
  { name: '홍타', handle: '@홍타의게임채널' },
  { name: '달콤니지', handle: '@dalkom_niji' },
  { name: '나군TV', handle: '@mrnatv_66' },
];

async function getCoupons() {
  let allCoupons: any[] = [];
  let debugLogs: string[] = [];

  try {
    const youtube = await Innertube.create({ lang: 'ko', location: 'KR' });
    debugLogs.push("✅ 유튜브 클라이언트 접속 성공");

    for (const yt of TARGETS) {
      try {
        // 1. 400 에러 우회: API 안 쓰고 그냥 웹페이지 HTML을 긁어옵니다.
        debugLogs.push(`🔍 [${yt.name}] 방송 탐색 중...`);
        
        const encodedHandle = encodeURI(yt.handle); // 한글 깨짐 방지
        const res = await fetch(`https://www.youtube.com/${encodedHandle}/streams`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });
        const html = await res.text();

        // 2. HTML 텍스트에서 영상 고유 ID(11자리)만 정규식으로 스나이핑 추출
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        
        if (!match) {
          debugLogs.push(`❌ [${yt.name}] 방송 중인 영상을 못 찾았습니다.`);
          continue;
        }

        const videoId = match[1];
        debugLogs.push(`▶️ [${yt.name}] 영상 ID 추출 성공: ${videoId}`);

        // 3. 빼낸 영상 ID로 댓글만 타겟팅해서 긁어오기 (이건 에러 안 남)
        const commentsData = await youtube.getComments(videoId);

        let fullText = "";
        if (commentsData && commentsData.contents) {
          for (const commentThread of commentsData.contents) {
            // @ts-ignore
            if (commentThread.is(YTNodes.CommentThread)) {
              // @ts-ignore
              const text = commentThread.comment?.content?.text || "";
              fullText += text + " ";
            }
          }
        }

        if (!fullText) {
          debugLogs.push(`⚠️ [${yt.name}] 댓글이 아직 없습니다.`);
        }

        // 4. 쿠폰 번호 추출
        const regex = /[A-Z0-9]{6,8}/g;
        const found = Array.from(new Set(fullText.match(regex) || []));

        if (found.length === 0 && fullText) {
          debugLogs.push(`⚠️ [${yt.name}] 댓글은 있으나 쿠폰 번호가 없습니다.`);
        }

        found.forEach((code, idx) => {
          allCoupons.push({
            id: `${yt.name}-${idx}-${code}`,
            youtuber: yt.name,
            code: code,
          });
          debugLogs.push(`🎉 [${yt.name}] 쿠폰 획득: ${code}`);
        });

      } catch (err: any) {
        debugLogs.push(`💥 [${yt.name}] 에러: ${err.message}`);
      }
    }
  } catch (mainErr: any) {
    debugLogs.push(`💥 유튜브 클라이언트 실패: ${mainErr.message}`);
  }

  return { allCoupons, debugLogs };
}

export default async function Page() {
  const { allCoupons, debugLogs } = await getCoupons();

  return (
    <div>
      <CouponClientUI coupons={allCoupons} />
      
      <div className="max-w-md mx-auto p-4 bg-gray-900 text-green-400 text-xs rounded-lg mt-8 font-mono shadow-inner mb-10">
        <p className="font-bold text-white mb-2">🛠️ 시스템 실시간 상태 로그</p>
        {debugLogs.map((log, i) => (
          <p key={i} className="mb-1">{log}</p>
        ))}
      </div>
    </div>
  );
}