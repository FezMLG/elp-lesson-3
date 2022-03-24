import fetch from "node-fetch";
import { networkInterfaces } from "os";
import {
  calculateCurrenciesDiff,
  calculateMidCurrencies,
  fetchCurrencies,
} from "../index";
import { ICurrency } from "../interfaces/Currency.interface";
import nock from "nock";
import fs from "fs";
import { saveTape } from "./test-utils/saveTape";

describe("api test", () => {
  test("api test", async () => {
    const response = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
    );
    const data = (await response.json()) as ICurrency;

    console.log(data);
  });
});

describe("testing currencies", () => {
  test.each(["USD", "EUR"])(
    "should return actual currencies rates",
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

  test("should return average currencies rates between dates", async () => {
    const response: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "041/A/NBP/2022", effectiveDate: "2022-03-01", mid: 4.2193 },
        { no: "042/A/NBP/2022", effectiveDate: "2022-03-02", mid: 4.3302 },
        { no: "043/A/NBP/2022", effectiveDate: "2022-03-03", mid: 4.3257 },
        { no: "044/A/NBP/2022", effectiveDate: "2022-03-04", mid: 4.391 },
      ],
    };
    const mid = calculateMidCurrencies(response);
    expect(mid).toEqual(
      Math.round(((4.2193 + 4.3302 + 4.3257 + 4.391) / 4) * 10000) / 10000
    );
  });

  test("should return difference between currencies rates from two dates", async () => {
    const response1: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "041/A/NBP/2022", effectiveDate: "2022-03-01", mid: 4.2193 },
      ],
    };
    const response2: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "044/A/NBP/2022", effectiveDate: "2022-03-04", mid: 4.391 },
      ],
    };
    const mid = calculateCurrenciesDiff(response1, response2);
    expect(mid).toEqual(Math.round((4.391 - 4.2193) * 10000) / 10000);
  });
});

describe("recording", () => {
  const timeNow = Date.now();
  beforeAll(async () => {
    nock.recorder.rec({ dont_print: true, output_objects: true });
    await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
    );
    nock.restore();
    const record = nock.recorder.play();
    await saveTape(String(timeNow), record);
    nock.recorder.clear();
  });
  beforeEach(() => {
    nock.disableNetConnect();
  });
  afterEach(() => {
    nock.enableNetConnect();
  });
  test("should recording work", async () => {
    // nock.recorder.rec({ dont_print: false, output_objects: true });
    // await fetch(
    //   `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
    // );
    // nock.restore();

    const response1 = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
    );
    expect(response1).toBeFalsy;

    nock.load(`${__dirname}/test-utils/__tapes__/${timeNow}.tape.json`);
    const response = await fetch(
      `https://api.nbp.pl/api/exchangerates/rates/a/USD/?format=json`
    );
    // const response = nock.recorder.play();
    expect(response).toBeTruthy;
  });
});

describe("testing currencies with recording", () => {
  test.each(["USD", "EUR"])(
    "should return actual currencies rates",
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

  test("should return average currencies rates between dates", async () => {
    const response: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "041/A/NBP/2022", effectiveDate: "2022-03-01", mid: 4.2193 },
        { no: "042/A/NBP/2022", effectiveDate: "2022-03-02", mid: 4.3302 },
        { no: "043/A/NBP/2022", effectiveDate: "2022-03-03", mid: 4.3257 },
        { no: "044/A/NBP/2022", effectiveDate: "2022-03-04", mid: 4.391 },
      ],
    };
    const mid = calculateMidCurrencies(response);
    expect(mid).toEqual(
      Math.round(((4.2193 + 4.3302 + 4.3257 + 4.391) / 4) * 10000) / 10000
    );
  });

  test("should return difference between currencies rates from two dates", async () => {
    const response1: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "041/A/NBP/2022", effectiveDate: "2022-03-01", mid: 4.2193 },
      ],
    };
    const response2: ICurrency = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: [
        { no: "044/A/NBP/2022", effectiveDate: "2022-03-04", mid: 4.391 },
      ],
    };
    const mid = calculateCurrenciesDiff(response1, response2);
    expect(mid).toEqual(Math.round((4.391 - 4.2193) * 10000) / 10000);
  });
});
