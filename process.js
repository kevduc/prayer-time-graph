import * as fs from "fs";
import * as path from "path";
import { EOL } from "os";
import { toHourFormat } from "./common/utils.js";

const sourceDir = "./data/12h";
const destDir = "./data/24h";

const sourceFiles = fs.readdirSync(sourceDir);

sourceFiles.forEach((sourceFileName) => {
  const sourceFile = `${sourceDir}/${sourceFileName}`;
  let data = fs.readFileSync(sourceFile, { encoding: "utf-8" });
  data = data.split(EOL).map((line, lineIndex) =>
    line.split(",").map((value, index, line) => {
      if (lineIndex === 0) return value;

      if (index === 0) return new Date(`${value} 2020`);

      let time = value.split(":").map((val) => parseInt(val));

      if (index > 3 || (index === 3 && time[0] < 8)) time[0] = time[0] + 12;
      const date = new Date(line[0]);
      time =
        60 * time[0] +
        time[1] +
        (sourceFileName.includes("London")
          ? date.getTimezoneOffset() +
            (((date.getMonth() === 2 || date.getMonth() === 9) && date.getDate() >= 26 && date.getDate() <= 28) ||
            (date.getMonth() === 9 && date.getDate() === 25)
              ? 60
              : 0)
          : 0);

      return toHourFormat(time);
    })
  );

  const ext = path.extname(sourceFileName);
  const sourceBasename = path.basename(sourceFileName, ext);

  const destFileCsv = `${destDir}/${sourceBasename} - 24h.csv`;
  const destFileJson = `${destDir}/${sourceBasename} - 24h.json`;

  if (fs.existsSync(destFileCsv)) fs.unlinkSync(destFileCsv);

  if (fs.existsSync(destFileJson)) fs.unlinkSync(destFileJson);

  data.forEach((line) => fs.appendFileSync(destFileCsv, line.join(",") + EOL));

  const dataTranspose = new Array(data[0].length).fill(0).map(() => []);
  const labels = data[0];
  data.splice(1).forEach((line) => line.forEach((value, index) => dataTranspose[index].push(value)));

  const dataJson = {};
  labels.forEach((name, index) => (dataJson[name] = dataTranspose[index]));

  fs.appendFileSync(destFileJson, JSON.stringify(dataJson));
});
