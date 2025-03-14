const API_KEY = process.env.VITE_CURRENCY_API_KEY || "cur_live_n6MwZsbGLs8nhgbJbMq3qPHdBXbB3P5fFyzVlAHb";
const BASE_URL = "https://api.currencyapi.com/v3";

export interface ExchangeRate {
  code: string;
  value: number;
}

export async function fetchExchangeRates(baseCurrency: string): Promise<Record<string, ExchangeRate>> {
  const response = await fetch(
    `${BASE_URL}/latest?apikey=${API_KEY}&base_currency=${baseCurrency}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await response.json();
  return data.data;
}

export function calculateConversion(amount: number, rate: number): number {
  return Number((amount * rate).toFixed(2));
}
