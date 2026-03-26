import { Innertube, YTNodes } from 'youtubei.js';
import CouponClientUI from './CouponClientUI';

export const revalidate = 600; // 10분 캐시

const TARGETS = [
  { name: '홍타', handle: '@홍타의게임채널' },
  { name: '달콤니지', handle: '@dalkom_niji' },
  { name: '나군TV', handle: '@mrnatv_66' },
];

async function getCoupons() {
  let allCoupons: { id: string; youtuber: string; code: string }[] = [];
  
  try {
    const youtube = await Innertube.create({ lang: 'ko', location: 'KR' });

    for (const yt of TARGETS) {
      try {
        const channel = await youtube.getChannel(yt.handle);
        const streams = await channel.getLiveStreams();
        
        // TS 에러 1번 해결: any로 덮어씌워서 강제로 id를 뽑아냄
        const latestVideo = streams?.videos?.[0] as any; 
        if (!latestVideo || !latestVideo.id) continue;

        // TS 에러 2번 해결: youtube 클라이언트 본체에서 직접 댓글 호출
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

        // 정규식: 영어 대문자와 숫자로 이루어진 6~8자리 탐색
        const regex = /[A-Z0-9]{6,8}/g;
        const found = Array.from(new Set(fullText.match(regex) || []));

        found.forEach((code, idx) => {
          allCoupons.push({
            id: `${yt.name}-${idx}-${code}`,
            youtuber: yt.name,
            code: code,
          });
        });

      } catch (err) {
        console.error(`${yt.name} 크롤링 실패:`, err);
      }
    }
  } catch (mainErr) {
    console.error('유튜브 클라이언트 생성 실패:', mainErr);
  }

  return allCoupons;
}

export default async function Page() {
  const coupons = await getCoupons();
  return <CouponClientUI coupons={coupons} />;
}