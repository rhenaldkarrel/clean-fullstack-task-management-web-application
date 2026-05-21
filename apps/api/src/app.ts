import express from "express";
import { APP_NAME } from "@task-app/shared";

export const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: APP_NAME
  });
});
