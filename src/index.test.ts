import fetch from "node-fetch";
import { calculateMidCurrencies, fetchCurrencies } from "./index";
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

test.each(["USD", "EUR"])(
  "should return actual currencies between dates",
  async (currency) => {
    const dateFrom = "2022-03-01";
    const dateTo = "2022-03-07";
    const response: ICurrency = await fetchCurrencies(
      currency,
      dateFrom,
      dateTo
    );
    const mid = calculateMidCurrencies(response);
    console.log(mid);
    // expect(response).toEqual({
    //   table: expect.any(String),
    //   currency: expect.any(String),
    //   code: currency,
    //   rates: [
    //     {
    //       no: expect.any(String),
    //       effectiveDate: expect.any(String),
    //       mid: expect.any(Number),
    //     },
    //   ],
    // });
  }
);

const response: ICurrency = {
  table: "A",
  currency: "dolar amerykański",
  code: "USD",
  rates: [{ no: "057/A/NBP/2022", effectiveDate: "2022-03-23", mid: 4.2772 }],
};
