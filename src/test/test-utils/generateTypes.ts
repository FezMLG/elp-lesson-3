import {
  InputData,
  jsonInputForTargetLanguage,
  quicktype,
} from "quicktype-core";
import fs from "fs";

export const generateTypes = async (url: string, name: string) => {
  const response = await fetch(url);
  const jsonString = await response.text();

  const jsonInput = jsonInputForTargetLanguage("typescript");
  await jsonInput.addSource({ name, samples: [jsonString] });
  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const serializedRenderResult = await quicktype({
    inputData: inputData,
    lang: "typescript",
    rendererOptions: { "just-types": "true" },
  });
  fs.writeFile(
    `${__dirname}/../../interfaces/${name}.interface.ts`,
    serializedRenderResult.lines.join("\n"),
    () => {}
  );
};
