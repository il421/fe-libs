import { Forma } from "../Forma";
import { FormaContext } from "../forma-api.types";
import { useContext } from "react";

export const useFormaContext = <
  FormValues extends object,
  TError extends Error = Error
>() => {
  const contextValue = useContext(Forma.Context);

  if (contextValue === undefined || !contextValue?.state) {
    throw new Error("No context provided");
  }

  return contextValue as unknown as FormaContext<FormValues, TError>;
};
