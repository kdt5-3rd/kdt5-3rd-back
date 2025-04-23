import axios from "axios";

// 📦 위치 정보 인터페이스
export interface Coordinate {
    lat: number;      // 위도
    lng: number;      // 경도
    mode?: string;    // 운송 수단 (예: 'driving', 'walking', 'transit')
    option?: string;  // 경로 옵션 (예: 'trafast', 'tracomfort' 등)
}
  
// 📦 경로 계산 요청에 사용할 전체 구조
export interface TravelInput {
    from: Coordinate;      // 출발지 정보
    to: Coordinate;        // 도착지 정보
    startTime: string;     // 일정 시작 시각 (ISO 형식 문자열)
}

// 📦 경로 계산 결과 데이터
export interface TravelResult {
    duration: number;                     // 소요 시간 (초 단위)
    distance: number;                     // 거리 (미터 단위)
    recommended_departure_time: string;   // 추천 출발 시각 (ISO 형식)
    path: [number, number][];             // 지도 경로 표시용 path (경도, 위도 순)
}

export interface TravelInfoResult {
    duration: number;                     // 소요 시간 (초 단위)
    distance: number;                     // 거리 (미터 단위)
    recommended_departure_time: string;   // 추천 출발 시각 (ISO 8601 형식 문자열)
    path: [number, number][];             // 지도에 그릴 경로 (경도, 위도 쌍 배열)
}

export const getTravelInfoDetailed = async (params: TravelInput): Promise<TravelInfoResult> => {
    const { from, to, startTime } = params;
  
    const response = await axios.get(
      'https://maps.apigw.ntruss.com/map-direction/v1/driving',
      {
        params: {
          start: `${from.lng},${from.lat}`,
          goal: `${to.lng},${to.lat}`,
          option: from.option || 'trafast'
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAP_CLIENT_ID!,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_MAP_CLIENT_SECRET!
        }
      }
    );
  
    const data = response.data.route?.trafast?.[0];
    if (!data) throw new Error('경로 계산 실패');
  
    const duration = data.summary.duration / 1000; // 초 단위
    const distance = data.summary.distance;        // 미터 단위
  
    const recommended_departure_time = new Date(
      new Date(startTime).getTime() - duration * 1000
    ).toISOString();
  
    return {
      duration,
      distance,
      recommended_departure_time,
      path: data.path
    };
};