import "dotenv/config";
import { createServer } from "./index.js";

const PORT = 3001;

const app = createServer();

app.listen(PORT, () => {
  console.log(`🚀 Express API server running on http://localhost:${PORT}`);
  console.log(`   API available at http://localhost:${PORT}/api/ping`);
});
