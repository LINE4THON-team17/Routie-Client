import React, { useEffect, useRef, useState } from 'react'
import { BottomNavBar } from '../layout/BottomNavBar'
import back_btn from '../../assets/icons/backIcon.svg'
import cameraIcon from '../../assets/icons/cameraIcon.svg'
import '../../assets/sass/newroute/uploading.scss'

const Uploading = () => {
    const [current, setCurrent] = useState(0)
    const [trackIndex, setTrackIndex] = useState(1)   
    const [isAnimating, setIsAnimating] = useState(true)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)

    const posts = [
        { id: 1, name: '1번 스타벅스 충무로역점', category: '카페' },
        { id: 2, name: '2번 공중 CGV', category: '영화관' },
        { id: 3, name: '3번 맛집 레스토랑', category: '식당' },
    ]
    const extended = [posts[posts.length - 1], ...posts, posts[0]]

    const sliderRef = useRef(null)
    useEffect(() => { }, [])

    const goTo = (i) => {
        setIsAnimating(true)
        setCurrent(i)
        setTrackIndex(i + 1)
    }
    const next = () => {
        setIsAnimating(true)
        setTrackIndex((p) => p + 1)
        setCurrent((p) => (p + 1) % posts.length)
    }
    const prev = () => {
        setIsAnimating(true)
        setTrackIndex((p) => p - 1)
        setCurrent((p) => (p - 1 + posts.length) % posts.length)
    }

    const handleTransitionEnd = () => {
        if (trackIndex === 0) {
            setIsAnimating(false)
            setTrackIndex(posts.length)
        } else if (trackIndex === posts.length + 1) {
            setIsAnimating(false)
            setTrackIndex(1)
        }
    }

    const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX)
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
    const onTouchEnd = () => {
        if (touchStart == null || touchEnd == null) return
        const diff = touchStart - touchEnd
        const threshold = 60
        if (diff > threshold) next()
        else if (diff < -threshold) prev()
        setTouchStart(null)
        setTouchEnd(null)
    }

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') next()
        else if (e.key === 'ArrowLeft') prev()
        else if (e.key === 'Enter') next()
    }

    return (
        <div id='uploading_wrap'>
            <div className="uploading_header">
                <button className="back_btn">
                    <img src={back_btn} alt="" />
                </button>
                <p>코스이름</p>
            </div>

            <div className="uploading_content">
                <div className="visitday">
                    <p>방문일 2025.01.01</p>
                </div>

                <div className="place_title">
                    <p>{posts[current].name}</p>
                    <div className="category">
                        <p>{posts[current].category}</p>
                    </div>
                    <button className="cancle">
                        <p>취소</p>
                    </button>
                </div>

                <div
                    className="slider"
                    ref={sliderRef}
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
                            transform: `translateX(calc(-${trackIndex * 100}% + ${trackIndex * 5}px))`, // 카드 간격만큼 보정
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extended.map((post, i) => {
                            const isCenter = i === trackIndex
                            return (
                                <div
                                    key={`${post.id}-${i}`}
                                    className={`slide_card${isCenter ? ' is-center' : ''}`}
                                >
                                    <div className="uploaded_img2">
                                        <img src={cameraIcon} alt="" className="camera" />
                                        <p>가장 기억에 남는 사진을 업로드 해주세요</p>
                                    </div>

                                    <div className="review">
                                        <textarea placeholder="간단 후기를 작성해주세요." maxLength={500} />
                                        <p className="limit">0/500자</p>
                                    </div>
                                </div>
                            )
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

                <button className="complete">
                    <p>업로드</p>
                </button>
            </div>

            <BottomNavBar />
        </div>
    )
}

export default Uploading
