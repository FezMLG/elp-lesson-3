import fs from "fs";
import nock from "nock/types";
import path from "path";

export const saveTape = (
  tapeName: string,
  data: string[] | nock.Definition[]
) => {
  return new Promise<void>((resolve) => {
    fs.mkdir(path.join(__dirname, "__tapes__"), () => {
      fs.writeFile(
        `${__dirname}/__tapes__/${tapeName}.tape.json`,
        JSON.stringify(data),
        (err) => {
          if (err) {
            return console.error(err);
          }
          resolve();
        }
      );
    });
  });
};
