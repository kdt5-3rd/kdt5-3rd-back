import axios from "axios";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

export const newsService = async (category: string) => {
  try {
    // API 요청 URL 생성
    const newsQuery: string = `https://newsdata.io/api/1/latest?apikey=${process.env.API_KEY}&country=kr&size=5&category=${category}`;

    // API 요청 보내기
    const response = await axios.get(newsQuery);

     // API 응답 데이터에서 description과 link만 추출
     const articles = response.data.results.map((item: any) => ({
        article_id: item.article_id,
        title: item.title,
        description: item.description,
        source_name: item.source_name,
        creator : item.creator,
        link: item.link,
        image_url: item.image_url,
        pubDate: item.pubDate,
        pubDateTZ : item.pubDateTZ,
      }));
  
      // 변환된 데이터 반환
      return articles;

  } catch (error: any) {
    console.error("뉴스 검색 중 오류 발생:", error);
  }
};
