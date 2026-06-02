import { renderHook } from "@testing-library/react";

import { Forma } from "../../Forma";
import { useFormaContext } from "../index";

describe("useFormContext", () => {
  it("should return state and actions correctly", () => {
    const wrapper =
      () =>
      ({ children }) => (
        <Forma.Provider onSubmit={async () => undefined}>
          {() => children}
        </Forma.Provider>
      );

    const { result } = renderHook(() => useFormaContext(), {
      wrapper: wrapper()
    });

    expect(result.current.state).toEqual({
      fields: {},
      values: {},
      initialValues: {},
      dirty: false,
      invalid: false,
      isSubmitting: false,
      submitFailed: false,
      submitSucceeded: false,
      triedToSubmit: false,
      submitError: undefined,
      readonly: undefined,
      disabled: undefined
    });

    expect(result.current.actions.registerField).toBeDefined();
    expect(result.current.actions.unRegisterField).toBeDefined();
    expect(result.current.actions.arrayMutators.update).toBeDefined();
    expect(result.current.actions.arrayMutators.push).toBeDefined();
    expect(result.current.actions.arrayMutators.remove).toBeDefined();
    expect(result.current.actions.arrayMutators.unshift).toBeDefined();
    expect(result.current.actions.setValue).toBeDefined();
    expect(result.current.actions.setValues).toBeDefined();
    expect(result.current.actions.reset).toBeDefined();
    expect(result.current.actions.blur).toBeDefined();
    expect(result.current.actions.focus).toBeDefined();
    expect(result.current.actions.submit).toBeDefined();
  });

  it("should be used in Form.Provider scope only", () => {
    expect(() => renderHook(() => useFormaContext())).toThrow(
      new Error("No context provided")
    );
  });
});
