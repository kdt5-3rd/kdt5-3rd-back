export const formatTravelFields = (row: any) => {
    const formatted = { ...row };
  
    // 소요시간 → 분 단위로 변환
    if (typeof row.travel_duration === 'number') {
      const minutes = Math.ceil(row.travel_duration / 60);
      formatted.travel_duration = `${minutes}분`;
    }
  
    // 거리 → 1km 이상이면 소수점, 아니면 m
    if (typeof row.travel_distance === 'number') {
      if (row.travel_distance >= 1000) {
        formatted.travel_distance = `${(row.travel_distance / 1000).toFixed(1)}km`;
      } else {
        formatted.travel_distance = `${row.travel_distance}m`;
      }
    }

    // 추천 출발 시각 → 오전/오후 hh:mm 포맷
    if (row.recommended_departure_time) {
        const date = new Date(row.recommended_departure_time);
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours < 12 ? '오전' : '오후';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        formatted.recommended_departure_time = `${period} ${hour12}:${minutes}`;
    }

    return formatted;
};