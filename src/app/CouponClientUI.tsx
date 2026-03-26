"use client";

import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function CouponClientUI({ coupons }: { coupons: any[] }) {
  const [toastMsg, setToastMsg] = useState("");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setToastMsg("✅ 쿠폰 복사 완료!\n(도움이 되셨다면 아래 광고 한 번 클릭 부탁드려요🙏)");
    
    // 3초 뒤에 알림창이 사라짐
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen relative">
      <h1 className="text-xl font-bold text-center mb-6 pt-4 text-gray-800">
        🎮 다크에덴 BJ 쿠폰 몰아보기
      </h1>
      
      {/* 반투명(블러) + 클릭 통과(pointer-events-none)되는 스텔스 알림창 */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 pointer-events-none ${toastMsg ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-black/70 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-lg text-sm text-center whitespace-pre-line border border-white/20">
          {toastMsg}
        </div>
      </div>

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
                aria-label="쿠폰 복사하기"
              >
                <Copy size={20} className="text-gray-700" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 쿠팡 파트너스 다이내믹 배너 스크립트를 넣을 자리 */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[150px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">💰 쿠팡 파트너스 배너 삽입 영역 💰</p>
      </div>
    </div>
  );
}