import { ILogger } from "./logger";
import { IMiddleware } from "./middleware";

export type FetchApiClientEntityConfig = Omit<RequestInit, "method" | "body">;
export type WithParams<T> = T & { params?: Record<string, unknown> };

export interface IFetchApiClientBase<
  ApiSchema = Record<string, IFetchApiClientEntity>
> {
  createInstance: (
    key: keyof FetchApiEndpointsConfig,
    config: FetchApiClientConfig
  ) => IFetchApiClientEntity;
  initialize(): ApiSchema;
}

export interface IFetchApiClientEntity {
  post: <T>(
    url: string,
    data?: T,
    config?: FetchApiClientEntityConfig
  ) => Promise<FetchApiClientResponse<T>>;
  put: <T>(
    url: string,
    data?: T,
    config?: FetchApiClientEntityConfig
  ) => Promise<FetchApiClientResponse<T>>;
  patch: <T>(
    url: string,
    data?: T,
    config?: FetchApiClientEntityConfig
  ) => Promise<FetchApiClientResponse<T>>;
  delete: <T>(
    url: string,
    config?: FetchApiClientEntityConfig
  ) => Promise<FetchApiClientResponse<T>>;
  get: <T>(
    url: string,
    config?: WithParams<FetchApiClientEntityConfig>
  ) => Promise<FetchApiClientResponse<T>>;
}

export type FetchApiClientConfig = {
  baseURL: string;
  overrideMiddlewares?: FetchApiClientHelperMiddlewares;
};

export type FetchApiEndpointsConfig<K extends string = string> = {
  [key in K]: FetchApiClientConfig;
};

export interface FetchApiClientHelperMiddlewares {
  request?: IMiddleware<FetchApiClientRequest>[];
  respond?: IMiddleware<FetchApiClientResponse<unknown>>[];
}

export interface FetchApiClientHelperOptions {
  getAccessToken: () => Promise<string | undefined>;
  noAuthHeader?: string;
  traceId?: string;
  logger?: ILogger;
  authHeader?: string;
  tokenSchema?: string;
}

export type FetchApiClientRequest = Pick<RequestInit, "method" | "headers"> & {
  url: string;
};

export type FetchApiClientResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  config: FetchApiClientRequest;
};
