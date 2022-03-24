import { ICurrency } from "./interfaces/Currency.interface";
import fetch from "node-fetch";
import { format } from "date-fns";

export const fetchCurrencies = async (
  currency: string,
  dateFrom?: string,
  dateTo?: string
) => {
  if (!(dateFrom && dateTo)) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    dateFrom = format(date, "yyyy-MM-dd");
    dateTo = format(date, "yyyy-MM-dd");
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

export const calculateMidCurrencies = (currency: ICurrency) => {
  let sum = 0;
  currency?.rates.forEach((rate) => {
    sum += rate.mid;
  });
  return Math.round((sum / currency?.rates.length) * 10000) / 10000;
};
