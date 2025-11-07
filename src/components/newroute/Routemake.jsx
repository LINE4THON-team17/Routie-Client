import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import { Layout } from '../layout/layout';
import '../../assets/sass/newroute/routemake.scss';

const Routemake = () => {
  const navigate = useNavigate();

  const [keywords, setKeywords] = useState([]);
  const tagInputRef = useRef(null);
  const tagifyRef = useRef(null);

  const titleRef = useRef(null);
  const recommendRef = useRef(null);

  useEffect(() => {
    if (!tagInputRef.current) return;

    tagifyRef.current = new Tagify(tagInputRef.current, {
      delimiters: ",| ",
      pattern: /^[^\s#]{1,20}$/,
      maxTags: 15,
      placeholder: "엔터로 추가",
      dropdown: { enabled: 0 },
      originalInputValueFormat: valuesArr => valuesArr.map(v => v.value)
    });

    const handleChange = () => {
      const arr = (tagifyRef.current?.value || []).map(v => v.value);
      setKeywords(arr);
    };

    tagifyRef.current.on('add', handleChange);
    tagifyRef.current.on('remove', handleChange);
    tagifyRef.current.on('edit:updated', handleChange);

    return () => {
      try { tagifyRef.current?.destroy(); } catch(e) {}
    };
  }, []);

  useEffect(() => {
    const autosize = (el) => {
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    autosize(titleRef.current);
    autosize(recommendRef.current);

    const onTitle = () => autosize(titleRef.current);
    const onRecom = () => autosize(recommendRef.current);

    titleRef.current?.addEventListener('input', onTitle);
    recommendRef.current?.addEventListener('input', onRecom);

    return () => {
      titleRef.current?.removeEventListener('input', onTitle);
      recommendRef.current?.removeEventListener('input', onRecom);
    };
  }, []);

  const goToPlaceSearch = () => {
    navigate("/placesearch", { state: { keywords } });
  };

  return (
    <Layout type="logo" text="">
      <div id="routemake_wrap">
        <div className="details">
          <div className="title">
            <p>루트 제목</p>
            <div className="input_box">
              <textarea
                ref={titleRef}
                rows={1}
                placeholder="입력"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="recommend">
            <p>누구에게 추천하나요?</p>
            <div className="input_box">
              <textarea
                ref={recommendRef}
                rows={1}
                placeholder="입력"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="keyword">
            <p>루트에 어울리는 키워드 (3개 이상 작성)</p>
            <div className="input_box tagify_box">
              <input
                ref={tagInputRef}
                name="keywords"
                type="text"
                placeholder="엔터로 키워드 추가"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="visit">
            <p>언제 이 루트를 방문하셨나요? (선택)</p>
            <div className="box">
              <div className="input_box1">
                <input type="text" inputMode="numeric" placeholder="" />
              </div>
              <div className="input_box2">
                <input type="text" inputMode="numeric" placeholder="" />
              </div>
              <div className="input_box2">
                <input type="text" inputMode="numeric" placeholder="" />
              </div>
            </div>
          </div>

          <button className="next" onClick={goToPlaceSearch}>
            <p>다음</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Routemake;
