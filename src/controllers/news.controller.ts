import { Request, Response, NextFunction } from "express";
import { newsService } from "../services/news.service";


export const newsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

    const { category } = req.query; // 쿼리 문자열에서 category 값 가져오기

    // 유효한 카테고리 목록
  const validCategories = [
    "top",
    "sports",
    "technology",
    "business",
    "science",
    "entertainment",
    "health",
    "world",
    "politics",
    "environment",
    "food",
  ];

  // 카테고리 값 검증
  if (!category || !validCategories.includes(category as string)) {
    res.status(400).json({
      success: false,
      message: "카테고리 값을 제대로 입력해주세요.",
    });
  }

  try {
    //category를 string으로 변환 후 뉴스 데이터 받아오기
    const articles  = await newsService(category as string); 
    
      res.status(200).json({
        total : 5,
        articles: articles,
      });

  } catch (err) {
    next(err);
  }
};

