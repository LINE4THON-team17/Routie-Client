import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavBar } from '../layout/BottomNavBar';
import back_btn from '../../assets/icons/backIcon.svg';
import searchIcon from '../../assets/icons/searchIcon.svg';
import '../../assets/sass/newroute/placesearch.scss';

let kakaoLoaderPromise = null;
function loadKakaoSDK() {
  if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
    return Promise.resolve(window.kakao);
  }
  if (!kakaoLoaderPromise) {
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    if (!appkey) {
      return Promise.reject(new Error('VITE_KAKAO_MAP_APP_KEY가 .env에 없습니다.'));
    }
    kakaoLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => {
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error('Kakao SDK 로딩 실패'));
          return;
        }
        window.kakao.maps.load(() => resolve(window.kakao));
      };
      script.onerror = () => reject(new Error('Kakao SDK 스크립트 불러오기 실패'));
      document.head.appendChild(script);
    });
  }
  return kakaoLoaderPromise;
}

const Placesearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const debounceTimer = useRef(null);

  const keyword = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      setErr(null);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);
        const kakao = await loadKakaoSDK();
        const places = new kakao.maps.services.Places();
        places.keywordSearch(keyword, (data, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const mapped = data.map(d => ({
              id: d.id,
              name: d.place_name,
              category:
                d.category_group_name ||
                (d.category_name ? d.category_name.split(' > ')[0] : '') ||
                '장소',
              address: d.road_address_name || d.address_name || '',
              latitude: d.y ? parseFloat(d.y) : null,
              longitude: d.x ? parseFloat(d.x) : null,
              raw: d,
            }));
            setResults(mapped);
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            setResults([]);
          } else {
            setResults([]);
            setErr('검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
          }
          setLoading(false);
        });
      } catch (e) {
        setLoading(false);
        setResults([]);
        setErr(e.message || '검색 초기화에 실패했어요.');
      }
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [keyword]);

  return (
    <div id="placesearch_wrap">
      <div className="search_header">
        <button className="back_btn" onClick={() => navigate(-1)}>
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

        {keyword === '' && (
          <div className="search_example">
            <p>🏠 도로명, 건물명 또는 지번으로 주소를 찾아보세요.</p>
            <p>🔎 예: 서울 중구 필동로1길 30 / 동국대학교 / 필동2가</p>
            <p>📍 도로명 주소가 어렵다면 건물명이나 동 이름으로 검색해보세요</p>
          </div>
        )}

        {keyword !== '' && (
          <div className="search_result">
            {loading && <p className="empty">검색 중…</p>}
            {!loading && err && <p className="empty">{err}</p>}
            {!loading && !err && results.length === 0 && (
              <p className="empty">검색 결과가 없어요.</p>
            )}
            {!loading && !err && results.length > 0 &&
              results.map((p) => (
                <button
                  key={p.id}
                  className="place_box"
                  type="button"
                  onClick={() => {
                    navigate('/addroute', {
                      state: {
                        title: location.state?.title || "",
                        target: location.state?.target || "",
                        keywords: location.state?.keywords || [],
                        visitedDate: location.state?.visitedDate || "",
                        place: {
                          id: p.id,
                          name: p.name,
                          category: p.category,
                          address: p.address || "",
                          latitude: p.latitude,
                          longitude: p.longitude,
                        },
                      },
                    });
                  }}
                >
                  <div className="address"><p>{p.address}</p></div>
                  <div className="main_address">
                    <div className="category"><p>{p.category}</p></div>
                    <div className="name"><p>{p.name}</p></div>
                  </div>
                </button>
              ))
            }
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Placesearch;
