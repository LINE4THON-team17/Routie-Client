export const categoryGroups = {
  // 생활 / 쇼핑
  pink: ["대형마트", "편의점", "숙박", "음식점", "브런치", "레스토랑"],

  // 교육 / 기관
  blue: [
    "어린이집",
    "유치원",
    "학교",
    "학원",
    "병원",
    "약국",
    "공원",
    "카페",
    "여행",
  ],

  // 문화 / 공공 / 관광
  green: ["문화시설", "공공기관", "관광명소", "관광지", "오름", "해변"],

  // 금융 / 부동산
  orange: ["은행", "중개업소"],

  // 교통 / 기타
  gray: ["주차장", "주유소", "충전소", "지하철역"],
};

export const categoryPalette = {
  pink: "#FE5081",
  blue: "#417FF9",
  green: "#2CCA6E",
  orange: "#FE9A35",
  gray: "#A6A6A6",
};

export const getCategoryColor = (categoryName) => {
  for (const [colorKey, names] of Object.entries(categoryGroups)) {
    if (names.includes(categoryName)) {
      return categoryPalette[colorKey];
    }
  }

  return categoryPalette.gray;
};
