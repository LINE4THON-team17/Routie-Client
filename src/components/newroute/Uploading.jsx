import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BottomNavBar } from '../layout/BottomNavBar';
import back_btn from '../../assets/icons/backIcon.svg';
import cameraIcon from '../../assets/icons/cameraIcon.svg';
import '../../assets/sass/newroute/uploading.scss';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'addroute_posts_v1';

const Uploading = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    try {
      const loaded = raw ? JSON.parse(raw) : [];
      if (!loaded || loaded.length === 0) {
        navigate('/addroute', { replace: true });
        return;
      }
      setPosts(loaded);
    } catch {
      navigate('/addroute', { replace: true });
    }
  }, [navigate]);

  const extended = useMemo(() => {
    if (posts.length === 0) return [];
    return [posts[posts.length - 1], ...posts, posts[0]];
  }, [posts]);

  const [current, setCurrent] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (posts.length > 0) {
      setCurrent(0);
      setTrackIndex(1);
      setIsAnimating(true);
    }
  }, [posts]);

  const goTo = (i) => {
    if (posts.length === 0) return;
    setIsAnimating(true);
    setCurrent(i);
    setTrackIndex(i + 1);
  };

  const next = () => {
    if (posts.length === 0) return;
    setIsAnimating(true);
    setTrackIndex((p) => p + 1);
    setCurrent((p) => (p + 1) % posts.length);
  };

  const prev = () => {
    if (posts.length === 0) return;
    setIsAnimating(true);
    setTrackIndex((p) => p - 1);
    setCurrent((p) => (p - 1 + posts.length) % posts.length);
  };

  const handleTransitionEnd = () => {
    if (posts.length === 0) return;
    if (trackIndex === 0) {
      setIsAnimating(false);
      setTrackIndex(posts.length);
    } else if (trackIndex === posts.length + 1) {
      setIsAnimating(false);
      setTrackIndex(1);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const id = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isAnimating, trackIndex]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    const threshold = 60;
    if (diff > threshold) next();
    else if (diff < -threshold) prev();
    setTouchStart(null);
    setTouchEnd(null);
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };

  const handleUpload = () => {
    console.log('UPLOAD DATA:', posts);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  if (posts.length === 0) return null;

  const handleRemoveCurrent = () => {
    setPosts((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== current);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (next.length === 0) {
        navigate('/addroute', { replace: true });
        return next;
      }
      const newCurrent = current >= next.length ? next.length - 1 : current;
      setCurrent(newCurrent);
      setIsAnimating(false);
      setTrackIndex(newCurrent + 1);
      requestAnimationFrame(() => setIsAnimating(true));
      return next;
    });
  };

  return (
    <div id='uploading_wrap'>
      <div className="uploading_header">
        <button className="back_btn" onClick={() => navigate(-1)}>
          <img src={back_btn} alt="" />
        </button>
        <p>코스이름</p>
      </div>

      <div className="uploading_content">
        <div className="visitday">
          <p>방문일 2025.01.01</p>
        </div>

        <div className="place_title">
          <p>{`${current + 1}번 ${posts[current].placeName || '장소 미지정'}`}</p>
          <div className="category">
            <p>{posts[current].category || '카테고리'}</p>
          </div>
          <button className="cancel" onClick={handleRemoveCurrent}>
            <p>취소</p>
          </button>
        </div>

        <div
          className="slider"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="게시글 슬라이더"
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button type="button" className="nav_zone left" tabIndex={-1} onClick={prev} aria-label="이전 게시글" />
          <button type="button" className="nav_zone right" tabIndex={-1} onClick={next} aria-label="다음 게시글" />

          <div
            className={`slider_track${isAnimating ? ' anim' : ''}`}
            style={{
              transform: `translateX(calc(-${trackIndex * 100}% + ${trackIndex * 5}px))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extended.map((post, i) => {
              const isCenter = i === trackIndex;
              return (
                <div key={`${post.placeName || 'post'}-${i}`} className={`slide_card${isCenter ? ' is-center' : ''}`}>
                  <div className="uploaded_img2">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={`${post.placeName || '이미지'}`} />
                    ) : (
                      <>
                        <img src={cameraIcon} alt="" className="camera" />
                        <p>가장 기억에 남는 사진을 업로드 해주세요</p>
                      </>
                    )}
                  </div>

                  <div className="review">
                    <textarea
                      placeholder="간단 후기를 작성해주세요."
                      maxLength={500}
                      value={post.review}
                      readOnly
                    />
                    <p className="limit">{(post.review || '').length}/500자</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="under_dots">
          {posts.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo(i)}
              aria-label={`${i + 1}번 게시글로 이동`}
            />
          ))}
        </div>

        <button className="complete" onClick={handleUpload}>
          <p>업로드</p>
        </button>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Uploading;
