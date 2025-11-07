import React, { useState } from 'react'
import { BottomNavBar } from '../layout/BottomNavBar'
import back_btn from '../../assets/icons/backIcon.svg'
import cameraIcon from '../../assets/icons/cameraIcon.svg'
import plusIcon from '../../assets/icons/plusIcon.svg'
import '../../assets/sass/newroute/addroute.scss'
import { useNavigate } from 'react-router-dom';

const Addroute = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([
    { imageUrl: '', review: '' },
  ]);

  const handleComplete = () => {
    navigate('/uploading');
  };

  const handleAddPost = () => {
    setPosts(prev => [...prev, { imageUrl: '', review: '' }]);
    requestAnimationFrame(() => {
      const scroller = document.querySelector('#addroute_wrap .content');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
  };

  const handleRemovePost = (idx) => {
    setPosts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImage = (idx, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPosts(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], imageUrl: url };
      return next;
    });
  };

  const handleReview = (idx, value) => {
    setPosts(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], review: value.slice(0, 500) };
      return next;
    });
  };

  return (
    <div id='addroute_wrap'>
      <div className="add_header">
        <button className="back_btn">
          <img src={back_btn} alt="" />
        </button>
        <p>글 작성</p>
      </div>

      <div className="content">
        {posts.map((post, idx) => (
          <div key={idx}>
            <div className="place_title">
              <p>{idx + 1}번 스타벅스 충무로역점</p>
              <div className="category">
                <p>카페</p>
              </div>
              <button className="cancle" onClick={() => handleRemovePost(idx)}>
                <p>취소</p>
              </button>
            </div>

            <div className="upload">
              <label htmlFor={`imageUpload-${idx}`} className='upload_label'>
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="preview" />
                ) : (
                  <>
                    <img src={cameraIcon} alt="" />
                    <p>가장 기억에 남는 사진을 업로드 해주세요</p>
                  </>
                )}
              </label>
              <input
                type="file"
                id={`imageUpload-${idx}`}
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImage(idx, e.target.files?.[0])}
              />
            </div>

            <div className="review">
              <textarea
                placeholder="간단 후기를 작성해주세요."
                maxLength={500}
                value={post.review}
                onChange={(e) => handleReview(idx, e.target.value)}
              />
              <p className="limit">{post.review.length}/500자</p>
            </div>
          </div>
        ))}

        <button className="plus_btn" onClick={handleAddPost}>
          <img src={plusIcon} alt="" />
        </button>

        <button
          className="complete"
          onClick={handleComplete}
          style={{ position: 'static', display: 'block', marginLeft: 'auto', marginBottom: '20px' }}
        >
          <p>완료</p>
        </button>
      </div>

      <BottomNavBar />
    </div>
  )
}

export default Addroute
