import { Innertube, YTNodes } from 'youtubei.js';
import CouponClientUI from './CouponClientUI';

export const revalidate = 600; // 10분마다 갱신 (서버 자원 아끼기)

const TARGETS = [
  { name: '홍타', handle: '@홍타의게임채널' },
  { name: '달콤니지', handle: '@dalkom_niji' },
  { name: '나군TV', handle: '@mrnatv_66' },
];

async function getCoupons() {
  let allCoupons: any[] = [];
  
  try {
    const youtube = await Innertube.create({ lang: 'ko', location: 'KR' });

    for (const yt of TARGETS) {
      try {
        const encodedHandle = encodeURI(yt.handle);
        const res = await fetch(`https://www.youtube.com/${encodedHandle}/streams`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          cache: 'no-store'
        });
        const html = await res.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        
        if (!match) continue;

        const videoId = match[1];
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
        console.error(`${yt.name} 크롤링 에러:`, err);
      }
    }
  } catch (mainErr) {
    console.error('유튜브 클라이언트 에러:', mainErr);
  }

  return allCoupons;
}

export default async function Page() {
  const coupons = await getCoupons();
  return <CouponClientUI coupons={coupons} />;
}