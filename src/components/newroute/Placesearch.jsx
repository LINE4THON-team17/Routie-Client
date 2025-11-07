import React, { useMemo, useState } from 'react';
import { BottomNavBar } from '../layout/BottomNavBar';
import back_btn from '../../assets/icons/backicon.svg';
import searchIcon from '../../assets/icons/searchIcon.svg';
import '../../assets/sass/newroute/placesearch.scss';

const MOCK_PLACES = [
  { id: 1, name: '스타벅스 충무로역점', category: '카페', address: '중구 장충동 12번길-34' },
  { id: 2, name: '스타벅스 동대입구점', category: '카페', address: '중구 장충동 50번지-7호' },
  { id: 3, name: '이디야 카페 필동점', category: '카페', address: '중구 필동로 1길 30' },
  { id: 4, name: '동국대학교 학생회관', category: '학교', address: '중구 필동로 1길 26' },
];

const Placesearch = () => {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const k = q.trim();
    if (!k) return [];
    return MOCK_PLACES.filter(p => {
      const hay = `${p.name} ${p.address} ${p.category}`.toLowerCase();
      return hay.includes(k.toLowerCase());
    });
  }, [q]);

  return (
    <div id="placesearch_wrap">
      <div className="search_header">
        <button className="back_btn">
          <img src={back_btn} alt="뒤로가기" />
        </button>
        <p>장소 검색</p>
      </div>

      <div className="search_detail">
        <div className="search_box">
          <div className="input_wrap">
            <img src={searchIcon} alt="" />
            <input
              type="text"
              placeholder="방문한 곳의 위치를 입력해주세요"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {q.trim() === '' && (
          <div className="search_example">
            <p>🏠 도로명, 건물명 또는 지번으로 주소를 찾아보세요.</p>
            <p>🔎 예: 서울 중구 필동로1길 30 / 동국대학교 / 필동2가</p>
            <p>📍 도로명 주소가 어렵다면 건물명이나 동 이름으로 검색해보세요</p>
          </div>
        )}

        {q.trim() !== '' && (
          <div className="search_result">
            {results.length === 0 ? (
              <p className="empty">검색 결과가 없어요.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  className="place_box"
                  type="button"
                  onClick={() => {
                    console.log('select place:', p);
                  }}
                >
                  <div className="address">
                    <p>{p.address}</p>
                  </div>
                  <div className="main_address">
                    <div className="category">
                      <p>{p.category}</p>
                    </div>
                    <div className="name">
                      <p>{p.name}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Placesearch;
