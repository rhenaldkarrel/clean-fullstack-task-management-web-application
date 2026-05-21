import { app } from "./app.js";
import { env } from "./shared/config/env.js";

app.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
});
