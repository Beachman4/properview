import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { QueryClient } from "@tanstack/react-query";
import { contract } from "@properview/api-contract";
import { initClient } from "@ts-rest/core";

let accessTokenGetter: () => string | null = () => {
  return null;
};

export const setAccessTokenGetter = (getter: () => string | null) => {
  accessTokenGetter = getter;
};

export const rQQueryClient = new QueryClient();

export const tsr = initTsrReactQuery(contract, {
  baseUrl: `${process.env.NEXT_PUBLIC_API_HOST}`,
  baseHeaders: {
    authorization: () => {
      return accessTokenGetter() ? `Bearer ${accessTokenGetter()}` : "";
    },
  },
});

export const vanillaClient = initClient(contract, {
  baseUrl: `${process.env.NEXT_PUBLIC_API_HOST}`,
  baseHeaders: {
    authorization: () => {
      return accessTokenGetter() ? `Bearer ${accessTokenGetter()}` : "";
    },
  },
});

export const tsrQueryClient = tsr.initQueryClient(rQQueryClient);
