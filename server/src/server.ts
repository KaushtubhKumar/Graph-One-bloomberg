import app from "./app"; // Import the default export directly
import { env } from "./utils/env";

app.listen(env.PORT, () => {
  console.log(`GraphOne API listening on http://localhost:${env.PORT}`);
  console.log(`   Health check: http://localhost:${env.PORT}/health`);
  console.log(`   Environment:  ${env.NODE_ENV}`);
});