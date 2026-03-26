"use client";

import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function CouponClientUI({ coupons }: { coupons: any[] }) {
  const [toastMsg, setToastMsg] = useState("");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setToastMsg("✅ 쿠폰 복사 완료!\n(서버 유지를 위해 아래 배너 한 번 클릭해주시면 사랑합니다🙏)");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen relative pb-10">
      <h1 className="text-xl font-bold text-center mb-6 pt-4 text-gray-800">
        🎮 다크에덴M BJ 쿠폰 모음
      </h1>
      
      {/* 반투명 스텔스 알림창 */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 pointer-events-none ${toastMsg ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-black/70 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-lg text-sm text-center whitespace-pre-line border border-white/20">
          {toastMsg}
        </div>
      </div>

      {/* 쿠폰 리스트 영역 */}
      <div className="space-y-3 mb-8">
        {coupons.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            아직 올라온 쿠폰이 없거나, 방송 전입니다.<br/>(10분마다 자동 갱신됩니다)
          </p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md mb-1 inline-block">
                  {c.youtuber}
                </span>
                <p className="font-mono text-xl font-bold tracking-widest text-blue-600">{c.code}</p>
              </div>
              <button 
                onClick={() => handleCopy(c.code)}
                className="bg-gray-50 hover:bg-gray-200 active:bg-gray-300 p-3 rounded-full transition-colors cursor-pointer"
              >
                <Copy size={20} className="text-gray-700" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 유튜브 채널 바로 가기 영역 (수정안 반영) */}
      <div className="mb-8 px-1">
        <h2 className="text-[13px] font-bold text-gray-500 mb-3 ml-1">📺 유튜브 채널 바로 가기</h2>
        <div className="grid grid-cols-3 gap-2">
          <a href="https://www.youtube.com/@홍타의게임채널" target="_blank" rel="noreferrer" 
             className="bg-white border rounded-lg py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
            홍타
          </a>
          <a href="https://www.youtube.com/@dalkom_niji" target="_blank" rel="noreferrer" 
             className="bg-white border rounded-lg py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
            달콤 니지
          </a>
          <a href="https://www.youtube.com/@mrnatv_66" target="_blank" rel="noreferrer" 
             className="bg-white border rounded-lg py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
            나군TV
          </a>
        </div>
      </div>

      {/* 💰 쿠팡 파트너스 배너 영역 💰 */}
      <div className="w-full flex flex-col items-center justify-center pt-6 border-t border-gray-200">
        <a href="https://link.coupang.com/a/eb8QXO" target="_blank" rel="noreferrer" referrerPolicy="unsafe-url" className="transition-transform hover:scale-[1.02]">
          <img 
            src="https://ads-partners.coupang.com/banners/975704?subId=&traceId=V0-301-5f9bd61900e673c0-I975704&w=320&h=100" 
            alt="쿠팡 추천 상품" 
            className="rounded-lg shadow-sm"
          />
        </a>
        {/* 쿠팡 파트너스 필수 대가성 문구 (스텔스 처리) */}
        <p className="text-[10px] text-gray-400 mt-3 text-center break-keep px-4">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>

    </div>
  );
}