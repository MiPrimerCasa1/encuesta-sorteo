import sharp from "sharp";
import { stat } from "node:fs/promises";

const input = "public/logo-arreglado-1.png";
const output = "public/logo.webp";

await sharp(input).webp({ quality: 82, effort: 4 }).toFile(output);

const [src, dst] = await Promise.all([stat(input), stat(output)]);
console.log(
  `Logo: ${(src.size / 1024).toFixed(0)} KB PNG → ${(dst.size / 1024).toFixed(0)} KB WebP`
);
