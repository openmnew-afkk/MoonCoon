import { createServer } from "./index.js";

const PORT = process.env.PORT || 8000;
const app = createServer();

app.listen(PORT, () => {
  console.log(`🎬 VseOkNax server running on http://localhost:${PORT}`);
});
