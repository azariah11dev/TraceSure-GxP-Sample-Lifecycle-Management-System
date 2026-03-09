import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the folder where index.html lives
app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
  console.log("Frontend running at http://localhost:3000");
});