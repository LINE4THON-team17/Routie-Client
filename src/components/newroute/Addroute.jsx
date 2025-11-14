import React, { useEffect, useRef, useState } from "react";
import { BottomNavBar } from "../layout/BottomNavBar";
import back_btn from "../../assets/icons/backIcon.svg";
import cameraIcon from "../../assets/icons/cameraIcon.svg";
import plusIcon from "../../assets/icons/plusIcon.svg";
import "../../assets/sass/newroute/addroute.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useUploadImage } from "../../api/imagesApi";

const STORAGE_KEY = "addroute_posts_v1";

const Addroute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: uploadImage } = useUploadImage();

  const [posts, setPosts] = useState(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const processedKeyRef = useRef(null);

  useEffect(() => {
    const incoming = location.state?.place;
    if (!incoming) return;

    const exists = posts.some((p) => p.placeName === incoming.name);
    if (exists) return;

    if (processedKeyRef.current === location.key) return;
    processedKeyRef.current = location.key;

    setPosts((prev) => [
      ...prev,
      {
        imageUrl: "",
        review: "",
        placeName: incoming.name,
        category: incoming.category,
        address: incoming.address || "",
        latitude: incoming.latitude ?? null,
        longitude: incoming.longitude ?? null,
      },
    ]);
  }, [location.key, location.state?.place, posts]);

  const handleComplete = () => {
    navigate("/uploading", {
      state: {
        title: location.state?.title || "",
        target: location.state?.target || "",
        keywords: location.state?.keywords || [],
        visitedDate: location.state?.visitedDate || "",
      },
    });
  };

  const handleAddPost = () =>
    navigate("/placesearch", {
      state: {
        title: location.state?.title || "",
        target: location.state?.target || "",
        keywords: location.state?.keywords || [],
        visitedDate: location.state?.visitedDate || "",
        from: "/addroute",
      },
    });

  const handleRemovePost = (idx) => {
    setPosts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImage = async (idx, file) => {
    if (!file) return;
    try {
      const { data: imageUrl } = await uploadImage(file);
      setPosts((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], imageUrl };
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 중 오류 발생");
    }
  };

  const handleReview = (idx, value) => {
    setPosts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], review: value.slice(0, 500) };
      return next;
    });
  };

  return (
    <div id="addroute_wrap">
      <div className="add_header">
        <button className="back_btn" onClick={() => navigate(-1)}>
          <img src={back_btn} alt="" />
        </button>
        <p>글 작성</p>
      </div>

      <div className="addroute_content">
        {posts.map((post, idx) => (
          <div key={`${post.placeName}-${idx}`}>
            <div className="place_title">
              <p>
                {idx + 1}번 {post.placeName || "장소 미지정"}
              </p>
              <div className="category">
                <p>{post.category || "카테고리"}</p>
              </div>
              <button className="cancel" onClick={() => handleRemovePost(idx)}>
                <p>취소</p>
              </button>
            </div>

            <div className="upload">
              <label htmlFor={`imageUpload-${idx}`} className="upload_label">
                <div className="upload_inner">
                  {post.imageUrl ? (
                    <img
                      className="preview"
                      src={post.imageUrl}
                      alt="preview"
                    />
                  ) : (
                    <>
                      <img className="camera" src={cameraIcon} alt="" />
                      <p className="upload_tip">
                        가장 기억에 남는 사진을 업로드 해주세요
                      </p>
                    </>
                  )}
                </div>
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

        <button className="complete" onClick={handleComplete}>
          <p>완료</p>
        </button>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Addroute;
