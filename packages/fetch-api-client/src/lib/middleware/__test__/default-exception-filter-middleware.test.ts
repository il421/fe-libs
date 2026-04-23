import { FetchApiError } from "../../errors";
import { FetchApiClientResponse } from "../../fetch-api-helper.types.js";
import { DefaultExceptionFilterMiddleware } from "../default-exception-filter.middleware";
import { IMiddleware } from "../middleware.inteface";

const TRACE_ID = "trace-123";
const TEST_URL = "https://api.example.com/users";

const createResponse = (
  status: number,
  statusText: string,
  data?: unknown,
  url: string = TEST_URL
): FetchApiClientResponse<unknown> => ({
  data,
  status,
  statusText,
  config: { url, method: "GET" }
});

describe("DefaultExceptionFilterMiddleware", () => {
  describe("with traceId", () => {
    const middleware = new DefaultExceptionFilterMiddleware(TRACE_ID);
    test("should pass traceId to FetchApiError for unhandled status codes", () => {
      const res = createResponse(429, "Too Many Requests", "details");

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect(e).toBeInstanceOf(FetchApiError);
        expect((e as FetchApiError).traceId).toBe(TRACE_ID);
      }
    });

    test("should forward url from response config", () => {
      const res = createResponse(
        500,
        "Server Error",
        "details",
        "https://api.example.com/users"
      );

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect((e as FetchApiError).url).toBe("https://api.example.com/users");
        expect((e as FetchApiError).traceId).toBe(TRACE_ID);
      }
    });
  });

  describe("error detail forwarding", () => {
    const middleware = new DefaultExceptionFilterMiddleware();

    test("should forward data from response to ServerError", () => {
      const data = { reason: "database down" };
      const res = createResponse(500, "Internal Server Error", data);

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect((e as FetchApiError).details).toBeDefined();
      }
    });

    test("should forward data from response to NotFoundError", () => {
      const data = { resource: "user" };
      const res = createResponse(404, "Not Found", data);

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect((e as FetchApiError).details).toBeDefined();
      }
    });

    test("should forward data from response to RequestError", () => {
      const data = { field: "email", error: "invalid" };
      const res = createResponse(400, "Bad Request", data);

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect((e as FetchApiError).details).toBeDefined();
      }
    });

    test("should forward data from response to AuthorisationError", () => {
      const data = { permission: "admin" };
      const res = createResponse(403, "Forbidden", data);

      try {
        middleware.onRejected(res);
      } catch (e) {
        expect((e as FetchApiError).details).toBeDefined();
      }
    });
  });

  describe("implements IMiddleware", () => {
    test("should not have onFulfilled defined", () => {
      const middleware = new DefaultExceptionFilterMiddleware();
      expect(
        (middleware as IMiddleware<FetchApiClientResponse<unknown>>).onFulfilled
      ).toBeUndefined();
    });

    test("should have onRejected defined", () => {
      const middleware = new DefaultExceptionFilterMiddleware();
      expect(middleware.onRejected).toBeDefined();
    });
  });
});
