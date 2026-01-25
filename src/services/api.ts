const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

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

export const api = {
  async getWeather(city: string): Promise<WeatherResponse> {
    const response = await fetch(
      `${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch weather"));
    }

    return response.json();
  },

  async getWeatherByCoords(
    latitude: number,
    longitude: number
  ): Promise<WeatherResponse> {
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch weather"));
    }

    return response.json();
  },

  async getForecast(
    latitude: number,
    longitude: number
  ): Promise<ForecastResponse> {
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch forecast"));
    }

    return response.json();
  },

  async getZmanim(latitude: number, longitude: number): Promise<ZmanimResponse> {
    const response = await fetch(
      `${API_BASE_URL}/zmanim?latitude=${latitude}&longitude=${longitude}`
    );

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to fetch zmanim"));
    }

    return response.json();
  },

  async getHebrewDate(): Promise<HebrewDateResponse> {
    const response = await fetch(`${API_BASE_URL}/hebrew-date`);

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Failed to fetch Hebrew date")
      );
    }

    return response.json();
  }
};
