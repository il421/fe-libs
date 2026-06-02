import { FunctionComponent, PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";

import { Forma } from "../../Forma";
import { UseFormaMethods } from "../../forma-api.types";
import { useFormaContext } from "../index";
import { useFormaInternalValidator } from "../index";

interface TextValues {
  field1?: string;
  field2?: string;
  field3?: string;
}
const validate = (values: TextValues) => ({
  field1: values.field2 === "test" ? "Invalid" : undefined,
  field2: !values.field2 ? "Invalid" : undefined,
  field3: undefined
});

let actionsPersisted: UseFormaMethods<TextValues> | undefined;
const Validator = () => {
  useFormaInternalValidator<TextValues>(validate);
  return null;
};

const Context: FunctionComponent<PropsWithChildren> = props => {
  return (
    <Forma.Provider<TextValues>
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSubmit={async () => {}}
      initialValues={{ field1: "", field2: "", field3: "" }}
      children={(state, actions) => {
        if (!actionsPersisted) {
          actionsPersisted = actions;
          actionsPersisted.registerField("field1");
          actionsPersisted.registerField("field2");
          actionsPersisted.registerField("field3");
        }
        return (
          <>
            <Validator />
            <input
              name="field1"
              value={state.values.field1}
              onChange={event => actions.setValue("field1", event.target.value)}
            />
            <input
              name="field2"
              value={state.values.field1}
              onChange={event => actions.setValue("field2", event.target.value)}
            />
            <input
              name="field3"
              value={state.values.field1}
              onChange={event => actions.setValue("field3", event.target.value)}
            />
            {props.children}
          </>
        );
      }}
    />
  );
};

afterEach(() => {
  actionsPersisted = undefined;
});

describe("useFormInternalValidator", () => {
  it("should validate when value changed", () => {
    const { result } = renderHook(() => useFormaContext<TextValues>(), {
      wrapper: Context
    });
    expect(result.current?.state.invalid).toBeTruthy();
    expect(result.current?.state.fields["field2"].error).toBe("Invalid");
  });

  it("should validate initial based on validator", () => {
    const { result } = renderHook(() => useFormaContext<TextValues>(), {
      wrapper: Context
    });

    act(() => {
      actionsPersisted?.setValue("field2", "test");
    });
    expect(result.current?.state.invalid).toBeTruthy();
    expect(result.current?.state.fields["field1"].error).toBe("Invalid");
  });
});
