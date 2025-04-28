import axios from "axios";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

interface AirQualityCurrent {
  time: string;
  pm10: number;
  pm2_5: number;
}

interface AirQualityResponse {
  current: AirQualityCurrent;
}

function formatLocalHour(date: Date): string {
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  return `${Y}-${M}-${D}T${h}:00`;
}

export const airQualityService = async (
  latitude: number,
  longitude: number
): Promise<AirQualityResponse> => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const currentHour = formatLocalHour(now);

    const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
    const params = {
      latitude,
      longitude,
      hourly: "pm10,pm2_5",
      timezone: "Asia/Seoul",
    };
    const { data } = await axios.get(url, { params });
    const { hourly } = data;

    const idx = hourly.time.findIndex((t: string) => t === currentHour);
    if (idx === -1) {
      const { status, body } = errorResponse(
        ERROR_CODES.NOT_FOUND,
        "현재 시각에 해당하는 hourly 대기질 데이터가 없습니다."
      );
      throw { ...body, status };
    }

    const current: AirQualityCurrent = {
      time: hourly.time[idx],
      pm10: hourly.pm10[idx],
      pm2_5: hourly.pm2_5[idx],
    };
    return { current };
  } catch (err: any) {
    if (err.status && err.code) {
      throw err;
    }
    const { status, body } = errorResponse(
      ERROR_CODES.INTERNAL,
      "대기질 데이터를 가져오는 중 오류가 발생했습니다.",
      { originalError: err.message }
    );
    throw { ...body, status };
  }
};
