export interface WeatherCondition {
    text: string;
    icon: string;
    code: number;
}

export interface WeatherLocation {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
}

export interface CurrentWeather {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: WeatherCondition;
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
}

export interface WeatherResponse {
    location: WeatherLocation;
    current: CurrentWeather;
}

export interface WeatherError {
    error: {
        code: number;
        message: string;
    };
}

export type WeatherApiResponse = WeatherResponse | WeatherError;

export function isWeatherError(
    response: WeatherApiResponse,
): response is WeatherError {
    return 'error' in response;
}
