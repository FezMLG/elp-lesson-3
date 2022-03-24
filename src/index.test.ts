import fetch from "node-fetch";
import { fetchCurrencies } from "./index";
import { ICurrency } from "./Currency.interface";

test("api test", async () => {
  const response = await fetch(
    `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
  );
  const data = (await response.json()) as ICurrency;

  console.log(data);
});

test.each(["USD", "EUR"])(
  "should return actual currencies",
  async (currency) => {
    const response: ICurrency = await fetchCurrencies(currency);
    expect(response).toEqual({
      table: expect.any(String),
      currency: expect.any(String),
      code: currency,
      rates: [
        {
          no: expect.any(String),
          effectiveDate: expect.any(String),
          mid: expect.any(Number),
        },
      ],
    });
  }
);

const response: ICurrency = {
  table: "A",
  currency: "dolar amerykański",
  code: "USD",
  rates: [{ no: "057/A/NBP/2022", effectiveDate: "2022-03-23", mid: 4.2772 }],
};
