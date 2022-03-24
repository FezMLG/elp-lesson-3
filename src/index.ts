import { ICurrency } from "./Currency.interface";
import fetch from "node-fetch";

export const fetchCurrencies = async (currency: string) => {
  const response = await fetch(
    `https://api.nbp.pl/api/exchangerates/rates/a/${currency}/?format=json`
  );
  const data = (await response.json()) as ICurrency;
  return data;
};
