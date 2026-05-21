import { describe, expect, it } from "vitest";
import { GetHealthUseCase } from "../../../application/health/get-health.use-case.js";

describe("get health use-case", () => {
  it("returns expected health payload shape", () => {
    const useCase = new GetHealthUseCase();
    const result = useCase.execute();

    expect(result).toMatchObject({
      status: "ok",
      service: expect.any(String),
      environment: expect.any(String),
      timestamp: expect.any(String)
    });
  });
});
