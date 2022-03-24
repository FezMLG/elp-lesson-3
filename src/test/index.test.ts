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
import { getUnpackedSettings } from "http2";
import path from "path";

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
  const timeNow = Date.now();

  const recordings = [
    { file: "USD", code: "USD", dateFrom: "2022-03-01", dateTo: "2022-03-01" },
    { file: "USD2", code: "USD", dateFrom: "2022-03-01", dateTo: "2022-03-07" },
    { file: "EUR", code: "EUR", dateFrom: "2022-03-01", dateTo: "2022-03-01" },
  ];

  beforeAll(async () => {
    nock.recorder.rec({ dont_print: true, output_objects: true });
    await Promise.all(
      recordings.map(async (recordSett) => {
        await fetchCurrencies(
          recordSett.code,
          recordSett.dateFrom,
          recordSett.dateTo
        );
      })
    );
    nock.restore();
    const records = nock.recorder.play();
    await Promise.all(
      records.map(async (value, index) => {
        await saveTape(`${String(timeNow)}.${recordings[index].file}`, value);
      })
    );
    nock.recorder.clear();
    console.log(nock.recorder.play());
  });

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.enableNetConnect();
  });

  afterAll(() => {
    const deleteAllTapes = () => {
      const directory = `${__dirname}/test-utils/__tapes__/`;

      fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        }
      });
    };
    // deleteAllTapes();
  });

  test.each(recordings)(
    "should return actual currencies rates",
    async (recordSett) => {
      const response: ICurrency = await fetchCurrencies(recordSett.code);
      expect(response).toEqual({
        table: expect.any(String),
        currency: expect.any(String),
        code: recordSett.code,
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

  test("should return difference between currencies rates from two dates", async () => {
    const response0: ICurrency = await fetchCurrencies(recordings[0].code);
    const response1: ICurrency = await fetchCurrencies(recordings[1].code);

    const mid = calculateCurrenciesDiff(response0, response1);
    expect(mid).toEqual(
      Math.round((response1.rates[0].mid - response0.rates[0].mid) * 10000) /
        10000
    );
  });
});
