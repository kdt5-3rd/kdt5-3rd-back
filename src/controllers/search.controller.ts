import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface NaverPlaceRaw {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export interface Place {
  name: string;
  category: string;
  description: string;
  roadAddress: string;
  address: string;
  mapx: number;
  mapy: number;
  link: string;
}

export const searchPlaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.query as string;
    const sortParam = req.query.sort as string;
    const displayParam = req.query.display as string;

    // 검색어 유효성 검사
    if (!query) {
        res
        .status(400)
        .json({ success: false, message: '검색어가 필요합니다.' });
        return;
    }

    // 정렬 기준 유효성 검사
    // 'random', 'comment' 중 하나만 사용할 수 있도록, 기본 값은 random으로.
    const allowedSorts = ['random', 'comment'];
    const sort = allowedSorts.includes(sortParam) ? sortParam : 'random';

    // 출력 갯수 유효성 검사
    // 1 미만, 5 초과, 숫자 아닌 값 입력 등을 방지.
    let display = Number(displayParam);
    if (isNaN(display) || display < 1 || display > 5) {
      display = 5;
    }

    // API 인증 데이터 유효성 검사
    const { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } = process.env;
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
        res
        .status(500)
        .json({ success: false, message: '네이버 API 인증 정보 누락' });
        return;
    }

    const response = await axios.get(
      'https://openapi.naver.com/v1/search/local.json',
      {
        params: {
          query,
          display,
          sort,
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        },
      }
    );

    // 반환된 data에서 필요한 부분만 추출
    const rawItems: NaverPlaceRaw[] = response.data.items;

    // 데이터를 적절한 형태로 가공
    const places: Place[] = rawItems.map((item) => ({
      name: item.title.replace(/<[^>]*>/g, ''),
      category: item.category,
      description: item.description,
      roadAddress: item.roadAddress,
      address: item.address,
      mapx: Number(item.mapx),
      mapy: Number(item.mapy),
      link: item.link,
    }));

    res.status(200).json({
      success: true,
      total: response.data.total,
      display,
      sort,
      items: places,
    });
  } catch (error) {
    next(error);
  }
};
