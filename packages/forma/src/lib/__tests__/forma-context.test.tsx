import { act, render, waitFor } from "@testing-library/react";

import { Forma } from "../Forma";
import {
  FormaMethods,
  FormaState,
  ProviderProps,
  UseFormaMethods
} from "../forma-api.types";

interface TestFormValues {
  field1?: string;
  field2?: boolean;
  field3?: number[];
}
describe("Form.Provider", () => {
  it("should register all basic context actions/methods", async () => {
    let methods: FormaMethods<TestFormValues>;
    render(
      <Forma.Provider<TestFormValues>
        onSubmit={async () => undefined}
        initialValues={{ field1: "" }}
        children={(_state, actions) => {
          if (!methods) {
            methods = actions;
          }
          return null;
        }}
      />
    );

    await waitFor(() => {
      expect(methods.registerField).toBeDefined();
      expect(methods.unRegisterField).toBeDefined();
      expect(methods.arrayMutators.remove).toBeDefined();
      expect(methods.arrayMutators.update).toBeDefined();
      expect(methods.arrayMutators.unshift).toBeDefined();
      expect(methods.arrayMutators.push).toBeDefined();
      expect(methods.arrayMutators.insert).toBeDefined();
      expect(methods.setValue).toBeDefined();
      expect(methods.reset).toBeDefined();
      expect(methods.blur).toBeDefined();
      expect(methods.focus).toBeDefined();
    });
  });

  it("should fire validation on form initialize", async () => {
    const validate = vi.fn().mockReturnValue({});
    render(
      <Forma.Provider
        onSubmit={async () => undefined}
        initialValues={{ field1: "" }}
        notify={() => undefined}
        validate={validate}
        children={(_state, actions) => {
          if (!_state.fields["field1"]) {
            actions.registerField("field1");
          }
          return null;
        }}
      />
    );

    expect(validate).toHaveBeenCalledTimes(1);
  });

  it("should fire validation on form initialize and a field change", async () => {
    const validate = vi.fn().mockReturnValue({});
    let methods: FormaMethods<TestFormValues>;
    render(
      <Forma.Provider<TestFormValues>
        onSubmit={async () => undefined}
        initialValues={{ field1: "" }}
        notify={() => undefined}
        validate={validate}
        children={(_state, actions) => {
          if (!methods) {
            methods = actions;
          }
          return null;
        }}
      />
    );

    act(() => {
      methods.setValue("field1", "test");
    });

    await waitFor(() => {
      expect(validate).toHaveBeenCalledTimes(2);
    });
  });

  it("should fire validate a field on change", async () => {
    let actions: FormaMethods<TestFormValues>;
    let state: FormaState<TestFormValues> | undefined;
    render(
      <Forma.Provider<TestFormValues>
        onSubmit={async () => undefined}
        initialValues={{ field1: "" }}
        notify={() => undefined}
        validate={values => {
          if (values["field1"]) {
            return { field1: "error" };
          }
          return {};
        }}
        children={(_state, _actions) => {
          if (!actions) {
            actions = _actions;
          }
          state = _state;

          return null;
        }}
      />
    );
    await waitFor(() => {
      expect(actions).toBeDefined();
      actions?.setValue("field1", "test");
    });

    await waitFor(() => {
      expect(state).toBeDefined();
      expect(state?.invalid).toBeTruthy();
      expect(state?.fields["field1"].error).toBe("error");
    });
  });

  it("should fire validate a fields on change of setValues", async () => {
    let actions: FormaMethods<TestFormValues>;
    let state: FormaState<TestFormValues>;
    render(
      <Forma.Provider<TestFormValues>
        onSubmit={async () => undefined}
        initialValues={{ field1: "", field2: true }}
        notify={() => undefined}
        validate={values => {
          return {
            ...(values["field1"] && { field1: "error" }),
            ...(values["field2"] && { field2: "error" })
          };
        }}
        children={(_state, _actions) => {
          if (!actions) {
            actions = _actions;
          }
          state = _state;

          return null;
        }}
      />
    );

    await waitFor(() => {
      expect(actions).toBeDefined();
      actions?.setValues({
        field1: "updatedValuesField1",
        field2: false
      });
    });

    await waitFor(() => {
      expect(state).toBeDefined();
      expect(state?.invalid).toBeTruthy();
      expect(state?.fields["field1"].error).toBe("error");
    });
  });

  it("should initialize values and initialValues as empty object if the latter is undefined ", async () => {
    let state: FormaState<TestFormValues>;

    render(
      <Forma.Provider<TestFormValues>
        onSubmit={async () => undefined}
        children={_state => {
          state = _state;
          return null;
        }}
      />
    );

    await waitFor(() => {
      expect(state).toBeDefined();
      expect(state.values).toBeDefined();
      expect(state.initialValues).toBeDefined();
    });
  });

  it("should perform multiple array action async", async () => {
    let perActions: UseFormaMethods<Pick<TestFormValues, "field3">>;
    let perState: FormaState<Pick<TestFormValues, "field3">>;

    render(
      <Forma.Provider<Pick<TestFormValues, "field3">>
        initialValues={{ field3: [1] }}
        onSubmit={async () => undefined}
      >
        {(state, actions) => {
          perState = state;
          perActions = actions;
          return null;
        }}
      </Forma.Provider>
    );

    act(() => {
      if (!perState?.fields?.field3) {
        perActions.registerField("field3");
      }
      perActions.arrayMutators.push("field3", 0);
      perActions.arrayMutators.push("field3", 2);
      perActions.arrayMutators.remove("field3", 1);
      perActions.arrayMutators.insert("field3", 1, 6);
    });

    await waitFor(() => {
      expect(perState.values["field3"]).toEqual([1, 6, 2]);
    });
  });

  it("should set value and submit form synchronously with correct form state if onSubmit promise RESOLVED", async () => {
    let actions: UseFormaMethods<Pick<TestFormValues, "field1">>;
    let state: FormaState<TestFormValues> | undefined;

    const onSubmit = (values: Pick<TestFormValues, "field1">) =>
      new Promise(resolve => resolve(values));

    const mockSubmit = vi.fn((values: Pick<TestFormValues, "field1">) =>
      onSubmit(values)
    ) as ProviderProps["onSubmit"];

    render(
      <Forma.Provider<Pick<TestFormValues, "field1">>
        initialValues={{ field1: "" }}
        onSubmit={mockSubmit}
      >
        {(_state, _actions) => {
          state = _state;
          actions = _actions;
          return null;
        }}
      </Forma.Provider>
    );

    await act(async () => {
      if (!state?.fields?.field1) {
        actions.registerField("field1");
      }
      actions.setValue("field1", "test");
      actions.submit();
    });

    await waitFor(() => {
      expect(state?.triedToSubmit).toBeTruthy();
      expect(state?.isSubmitting).toBeFalsy();
      expect(state?.submitSucceeded).toBeTruthy();
      expect(mockSubmit).toHaveBeenLastCalledWith(
        { field1: "test" },
        expect.anything()
      );
    });
  });

  it("should set value and submit form synchronously with correct form state if onSubmit promise REJECTED", async () => {
    let actions: UseFormaMethods<Pick<TestFormValues, "field1">>;
    let state: FormaState<TestFormValues> | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onSubmit = (_values: Pick<TestFormValues, "field1">) =>
      new Promise((_, reject) => reject("Error"));

    const mockSubmit = vi.fn((values: Pick<TestFormValues, "field1">) =>
      onSubmit(values)
    ) as ProviderProps["onSubmit"];

    render(
      <Forma.Provider<Pick<TestFormValues, "field1">>
        initialValues={{ field1: "" }}
        onSubmit={mockSubmit}
      >
        {(_state, _actions) => {
          state = _state;
          actions = _actions;
          return null;
        }}
      </Forma.Provider>
    );

    await act(async () => {
      if (!state?.fields?.field1) {
        actions.registerField("field1");
      }
      actions.setValue("field1", "test");
      actions.submit();
    });

    await waitFor(() => {
      expect(state?.triedToSubmit).toBeTruthy();
      expect(state?.isSubmitting).toBeFalsy();
      expect(state?.submitSucceeded).toBeFalsy();
      expect(state?.submitFailed).toBeTruthy();
      expect(state?.submitError).toBe("Error");
    });
  });

  it("should read disabled and readonly props", async () => {
    let state: FormaState<TestFormValues> | undefined;
    render(
      <Forma.Provider
        onSubmit={async () => undefined}
        initialValues={{ field1: "" }}
        notify={() => undefined}
        disabled
        readonly
        children={_state => {
          state = _state;
          return null;
        }}
      />
    );

    await waitFor(() => {
      expect(state?.disabled).toBeTruthy();
      expect(state?.readonly).toBeTruthy();
    });
  });
});
