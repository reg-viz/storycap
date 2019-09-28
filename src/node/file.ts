import fs from "fs";
import path from "path";
import * as mkdirp from "mkdirp";
import { MainOptions } from "./types";
import { VariantKey } from "../types";

export class FileSystem {
  constructor(private opt: MainOptions) {}

  save(kind: string, story: string, variantKey: VariantKey, buffer: Buffer) {
    const name = this.opt.flat ? (kind + "_" + story).replace(/\//g, "_") : kind + "/" + story;
    const filePath = path.join(
      this.opt.outDir,
      name + (variantKey.keys.length ? `_${variantKey.keys.join("_")}` : "") + ".png",
    );
    return new Promise<string>((resolve, reject) => {
      mkdirp.sync(path.dirname(filePath));
      fs.writeFile(filePath, buffer, err => {
        if (err) reject(err);
        resolve(filePath);
      });
    });
  }
}
