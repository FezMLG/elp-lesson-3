import { ICurrency } from "./interfaces/Currency.interface";
import fetch from "node-fetch";
import { format } from "date-fns";
import { fi } from "date-fns/locale";

export const fetchCurrencies = async (
  currency: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ICurrency> => {
  if (!(dateFrom && dateTo)) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    dateFrom = format(date, "yyyy-MM-dd");
    dateTo = format(date, "yyyy-MM-dd");
  }
  if (!dateTo) {
    dateTo = dateFrom;
  }

  try {
    const response = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${dateFrom}/${dateTo}/?format=json`
    );
    const data = (await response.json()) as ICurrency;
    return data;
  } catch (e) {
    throw new Error(`API Error: ${e}`);
  }
};

export const calculateMidCurrencies = (currency: ICurrency): number => {
  let sum = 0;
  currency.rates.forEach((rate) => {
    sum += rate.mid;
  });
  return Math.round((sum / currency.rates.length) * 10000) / 10000;
};

export const calculateCurrenciesDiff = (
  currency1: ICurrency,
  currency2: ICurrency
): number => {
  let diff = 0;
  diff =
    Math.round((currency2.rates[0].mid - currency1.rates[0].mid) * 10000) /
    10000;
  return diff;
};
