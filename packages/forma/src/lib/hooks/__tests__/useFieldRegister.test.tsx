import { FunctionComponent, PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";

import { Forma } from "../../Forma";
import {
  defaultFieldState,
  FormaMethods,
  FormaState
} from "../../forma-api.types";
import { useFieldRegister } from "../index";

interface FormValues {
  field1: string;
  field2: boolean;
  field3?: string[];
  field4?: Date;
}

const setUp = (registerHooks: () => void) => {
  const notify = vi.fn();
  let persistedAction: FormaMethods<FormValues> | undefined;
  let state: FormaState<FormValues> | undefined;

  const Context: FunctionComponent<PropsWithChildren> = props => {
    return (
      <Forma.Provider<FormValues>
        initialValues={{
          field1: "1",
          field2: true,
          field3: [],
          field4: new Date("2025-01-23")
        }}
        notify={notify}
        onSubmit={async () => undefined}
      >
        {(_state, actions) => {
          if (!persistedAction) {
            persistedAction = actions;
          }

          state = _state;
          return props.children;
        }}
      </Forma.Provider>
    );
  };
  renderHook(() => registerHooks(), {
    wrapper: Context
  });
  return { notify, persistedAction, getState: () => state };
};

describe("useFieldRegister", () => {
  it("should register field", async () => {
    const { getState } = setUp(() => useFieldRegister("field1"));
    await waitFor(() => {
      expect(getState()?.fields["field1"].registered).toBeTruthy();
    });
  });

  it("should notify when value has been changed", async () => {
    const { notify, persistedAction } = setUp(() => useFieldRegister("field1"));
    act(() => {
      persistedAction?.setValue("field1", "2");
    });

    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith({
        field: "field1",
        value: "2",
        getState: expect.anything(),
        actions: { reset: expect.anything(), setValue: expect.anything() }
      });
    });
  });

  it("should not notify  when value has been changed", async () => {
    const { notify, persistedAction } = setUp(() => useFieldRegister("field3"));
    act(() => {
      persistedAction?.setValue("field3", []); //field3 initial value is []
      persistedAction?.setValue("field4", new Date("2025-01-23")); //field4 initial value is new Date("2025-01-23")
    });

    expect(notify).toHaveBeenCalledTimes(0);
  });

  it("should notify when array value has been changed", async () => {
    const { notify, persistedAction } = setUp(() => useFieldRegister("field3"));
    act(() => {
      persistedAction?.setValue("field3", [1]);
    });

    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(1);
    });
  });

  it("should notify when multiple values have been changed", async () => {
    const { notify, persistedAction } = setUp(() => {
      useFieldRegister("field1");
      useFieldRegister("field2");
    });

    act(() => {
      persistedAction?.setValues({
        field1: "updatedValuesField1",
        field2: false
      });
    });

    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(2);
      expect(notify).toHaveBeenCalledWith({
        field: "field1",
        value: "updatedValuesField1",
        getState: expect.anything(),
        actions: { reset: expect.anything(), setValue: expect.anything() }
      });

      expect(notify).toHaveBeenCalledWith({
        field: "field2",
        value: false,
        getState: expect.anything(),
        actions: { reset: expect.anything(), setValue: expect.anything() }
      });
    });
  });

  it("should register fields again with default field state if form has been reset", async () => {
    const { persistedAction, getState } = setUp(() =>
      useFieldRegister("field1")
    );
    expect(getState()?.fields).toEqual({ field1: defaultFieldState });

    act(() => {
      persistedAction?.setValue("field1", "5");
    });

    await waitFor(() => {
      expect(getState()?.values["field1"]).toBe("5");
      expect(getState()?.fields["field1"].dirty).toBeTruthy();
    });

    act(() => {
      persistedAction?.reset();
    });

    expect(getState()?.fields).toEqual({ field1: defaultFieldState });
  });
});
