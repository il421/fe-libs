import { ProviderProps } from "../forma-api.types";
import { useFormaInternalValidator } from "../hooks";

type FormaValidatorProps<FormValues extends object = object> = Pick<
  ProviderProps<FormValues>,
  "validate"
>;

export const FormaValidator = <FormValues extends object = object>(
  props: FormaValidatorProps<FormValues>
) => {
  useFormaInternalValidator(props.validate);
  return null;
};
