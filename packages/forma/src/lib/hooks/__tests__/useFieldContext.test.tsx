import { FunctionComponent, PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";

import { Forma } from "../../Forma";
import { FormaMeta } from "../../forma-api.types";
import { useFieldContext } from "../index";

const notify = vi.fn();
const Context: FunctionComponent<PropsWithChildren<FormaMeta>> = props => {
  return (
    <Forma.Provider
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSubmit={async () => {}}
      initialValues={{
        field1: "1",
        field2: { arr1: [{ field3: { arr2: [{ value: "2" }] } }] }
      }}
      disabled={props.disabled}
      readonly={props.readonly}
      children={() => props.children}
      notify={notify}
    />
  );
};
describe("useFieldContext", () => {
  it("should return state and actions correctly", () => {
    const { result } = renderHook(() => useFieldContext("field1"), {
      wrapper: Context
    });

    expect(result.current.value).toBe("1");
    expect(result.current.values).toEqual({
      field1: "1",
      field2: { arr1: [{ field3: { arr2: [{ value: "2" }] } }] }
    });

    expect(result.current.blurField).toBeDefined();
    expect(result.current.focusField).toBeDefined();
    expect(result.current.setFieldValue).toBeDefined();
  });

  it("should return state and actions correctly if nested name", () => {
    const { result } = renderHook(
      () => useFieldContext("field2.arr1[0].field3.arr2[0].value"),
      {
        wrapper: Context
      }
    );

    expect(result.current.value).toBe("2");
    expect(result.current.values).toEqual({
      field1: "1",
      field2: { arr1: [{ field3: { arr2: [{ value: "2" }] } }] }
    });

    expect(result.current.blurField).toBeDefined();
    expect(result.current.focusField).toBeDefined();
    expect(result.current.setFieldValue).toBeDefined();
  });

  it("should return disabled and readonly state if passed to Form.Provider", () => {
    const { result } = renderHook(() => useFieldContext("field1"), {
      wrapper: props => <Context {...props} readonly disabled />
    });

    expect(result.current.disabledForm).toBeTruthy();
    expect(result.current.readonlyForm).toBeTruthy();
  });

  it("should reset field value as initial one", async () => {
    const { result } = renderHook(
      () => {
        return useFieldContext("field1");
      },
      {
        wrapper: props => <Context {...props} readonly disabled />
      }
    );

    expect(result.current?.resetFieldValue).toBeDefined();
    // Set new value
    await act(async () => {
      result.current.setFieldValue("2");
    });
    expect(result.current.value).toBe("2");

    // Reset to initial value
    await act(async () => {
      result.current.resetFieldValue();
    });

    expect(result.current.value).toBe("1");
  });
});
