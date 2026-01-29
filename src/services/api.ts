const defaultApiUrl = "/api";
const envApiUrl = process.env.REACT_APP_API_URL;
const rawApiUrl =
  envApiUrl && envApiUrl.trim().length > 0 ? envApiUrl : defaultApiUrl;
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
const API_URL =
  isLocalhost && normalizedApiUrl.includes("vercel.app")
    ? defaultApiUrl
    : normalizedApiUrl;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text) as { error?: string; message?: string };
      if (data?.error) return data.error;
      if (data?.message) return data.message;
    } catch {
      // Non-JSON response body, fall through to raw text.
    }
    return text;
  } catch {
    return fallback;
  }
};

const ensureWeatherResponse = (data: unknown): WeatherResponse => {
  const value = data as WeatherResponse;
  if (!value || !isNonEmptyString(value.name)) {
    throw new Error("Invalid weather response: missing name");
  }
  if (
    !value.main ||
    !isNumber(value.main.temp) ||
    !isNumber(value.main.feels_like) ||
    !isNumber(value.main.humidity)
  ) {
    throw new Error("Invalid weather response: missing main data");
  }
  if (!Array.isArray(value.weather) || !value.weather[0]?.description) {
    throw new Error("Invalid weather response: missing weather details");
  }
  return value;
};

const ensureForecastResponse = (data: unknown): ForecastResponse => {
  const value = data as ForecastResponse;
  if (!Array.isArray(value.list)) {
    throw new Error("Invalid forecast response: missing list");
  }
  if (
    value.list.length > 0 &&
    (!isNumber(value.list[0]?.dt) ||
      !isNonEmptyString(value.list[0]?.dt_txt) ||
      !isNumber(value.list[0]?.main?.temp))
  ) {
    throw new Error("Invalid forecast response: missing fields");
  }
  return value;
};

const ensureZmanimResponse = (data: unknown): ZmanimResponse => {
  const value = data as ZmanimResponse;
  const times = value?.times;
  if (!times) {
    throw new Error("Invalid zmanim response: missing times");
  }
  const requiredFields = [
    "alotHaShachar",
    "sunrise",
    "sofZmanShma",
    "sofZmanTfilla",
    "chatzot",
    "minchaGedola",
    "plagHaMincha",
    "sunset",
    "tzeit"
  ] as const;
  for (const field of requiredFields) {
    if (!isNonEmptyString(times[field])) {
      throw new Error(`Invalid zmanim response: missing ${field}`);
    }
  }
  return value;
};

const ensureHebrewDateResponse = (data: unknown): HebrewDateResponse => {
  const value = data as HebrewDateResponse;
  if (
    !isNonEmptyString(value.hm) ||
    (typeof value.hd !== "string" && typeof value.hd !== "number") ||
    (typeof value.hy !== "string" && typeof value.hy !== "number")
  ) {
    throw new Error("Invalid Hebrew date response");
  }
  return value;
};

export interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  coord?: {
    lat: number;
    lon: number;
  };
  cached?: boolean;
}

export interface ForecastResponse {
  list?: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
    };
    weather: Array<{
      icon: string;
    }>;
  }>;
  cached?: boolean;
}

export interface ZmanimResponse {
  times: {
    alotHaShachar: string;
    sunrise: string;
    sofZmanShma: string;
    sofZmanTfilla: string;
    chatzot: string;
    minchaGedola: string;
    plagHaMincha: string;
    sunset: string;
    tzeit: string;
    tzeit42min?: string;
    tzeit50min?: string;
    tzeit72min?: string;
  };
  location?: {
    tzid?: string;
  };
  cached?: boolean;
}

export interface HebrewDateResponse {
  hd: string | number;
  hm: string;
  hy: string | number;
  cached?: boolean;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export const api = {
  async getWeather(city: string): Promise<WeatherResponse> {
    const response = await fetch(
      `${API_URL}/weather?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch weather"));
    }

    const data = await response.json();
    return ensureWeatherResponse(data);
  },

  async getWeatherByCoords(
    latitude: number,
    longitude: number
  ): Promise<WeatherResponse> {
    const response = await fetch(
      `${API_URL}/weather?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch weather"));
    }

    const data = await response.json();
    return ensureWeatherResponse(data);
  },

  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<ForecastResponse> {
    const response = await fetch(
      `${API_URL}/forecast?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch forecast"));
    }

    const data = await response.json();
    return ensureForecastResponse(data);
  },

  async getZmanim(latitude: number, longitude: number): Promise<ZmanimResponse> {
    const response = await fetch(
      `${API_URL}/zmanim?latitude=${latitude}&longitude=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch zmanim"));
    }

    const data = await response.json();
    return ensureZmanimResponse(data);
  },

  async getHebrewDate(): Promise<HebrewDateResponse> {
    const response = await fetch(`${API_URL}/hebrew-date`);

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Failed to fetch Hebrew date")
      );
    }

    const data = await response.json();
    return ensureHebrewDateResponse(data);
  },

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Health check failed"));
    }
    const data = (await response.json()) as HealthResponse;
    if (!data || !isNonEmptyString(data.status)) {
      throw new Error("Invalid health response");
    }
    return data;
  }
};
