import { Innertube, YTNodes } from 'youtubei.js';
import CouponClientUI from './CouponClientUI';

// 1. 캐시 강제 무력화: 새로고침할 때마다 무조건 다시 긁어오게 만듭니다 (원인 파악용)
export const dynamic = 'force-dynamic';

const TARGETS = [
  { name: '홍타', handle: '@홍타의게임채널' },
  { name: '달콤니지', handle: '@dalkom_niji' },
  { name: '나군TV', handle: '@mrnatv_66' },
];

async function getCoupons() {
  let allCoupons: any[] = [];
  let debugLogs: string[] = []; // 봇이 무슨 짓을 하고 있는지 기록하는 블랙박스

  try {
    const youtube = await Innertube.create({ lang: 'ko', location: 'KR' });
    debugLogs.push("✅ 유튜브 클라이언트 접속 성공");

    for (const yt of TARGETS) {
      try {
        const channel = await youtube.getChannel(yt.handle);
        const streams = await channel.getLiveStreams();
        const latestVideo = streams?.videos?.[0] as any;

        if (!latestVideo || !latestVideo.id) {
          debugLogs.push(`❌ [${yt.name}] 라이브 탭에 영상이 없습니다.`);
          continue;
        }

        debugLogs.push(`▶️ [${yt.name}] 라이브 영상 발견 (ID: ${latestVideo.id})`);
        const commentsData = await youtube.getComments(latestVideo.id);

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
          debugLogs.push(`⚠️ [${yt.name}] 영상은 있으나 댓글을 읽을 수 없습니다.`);
        }

        const regex = /[A-Z0-9]{6,8}/g;
        const found = Array.from(new Set(fullText.match(regex) || []));

        if (found.length === 0 && fullText) {
          debugLogs.push(`⚠️ [${yt.name}] 댓글은 읽었으나 쿠폰 번호 형태를 못 찾았습니다.`);
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
        debugLogs.push(`💥 [${yt.name}] 에러 발생: ${err.message}`);
      }
    }
  } catch (mainErr: any) {
    debugLogs.push(`💥 유튜브 접속 자체 실패: ${mainErr.message}`);
  }

  return { allCoupons, debugLogs };
}

export default async function Page() {
  const { allCoupons, debugLogs } = await getCoupons();

  return (
    <div>
      <CouponClientUI coupons={allCoupons} />
      
      {/* 화면 맨 밑에 원인 분석용 로그 출력 영역 추가 */}
      <div className="max-w-md mx-auto p-4 bg-gray-900 text-green-400 text-xs rounded-lg mt-8 font-mono shadow-inner mb-10">
        <p className="font-bold text-white mb-2">🛠️ 시스템 실시간 상태 로그</p>
        {debugLogs.map((log, i) => (
          <p key={i} className="mb-1">{log}</p>
        ))}
      </div>
    </div>
  );
}