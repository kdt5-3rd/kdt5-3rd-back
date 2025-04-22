import dotenv from "dotenv";
dotenv.config();

import app from "./app";

console.log("▶︎ DB_HOST =", process.env.DB_HOST);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
