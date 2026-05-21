import { APP_NAME } from "@task-app/shared";
import { env } from "../../shared/config/env.js";

export type HealthStatus = {
  status: "ok";
  service: string;
  environment: string;
  timestamp: string;
};

export class GetHealthUseCase {
  execute(): HealthStatus {
    return {
      status: "ok",
      service: APP_NAME,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
  }
}
