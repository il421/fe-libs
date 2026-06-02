import { FunctionComponent, PropsWithChildren } from "react";
import { expect } from "vitest";

import { act, renderHook } from "@testing-library/react";

import { Forma } from "../../Forma";
import { UseFormaMethods } from "../../forma-api.types";
import { useFieldArray } from "../index";

let actionsPersisted: UseFormaMethods<{ field1: string[] }> | undefined;

const Context: FunctionComponent<PropsWithChildren> = props => {
  return (
    <Forma.Provider
      initialValues={{
        field1: ["1", "2"]
      }}
      onSubmit={async () => undefined}
    >
      {(_state, actions) => {
        if (!actionsPersisted) {
          actionsPersisted = actions;
        }
        return props.children;
      }}
    </Forma.Provider>
  );
};

describe("useFieldArray", () => {
  it("should register array as a field and return: names, array methods and array values", async () => {
    const { result } = renderHook(() => useFieldArray("field1"), {
      wrapper: Context
    });

    // Contains all array methods
    expect(Object.keys(result.current.actions)).toEqual([
      "push",
      "unshift",
      "remove",
      "update",
      "insert",
      "replace"
    ]);
    // Return initial 2 names and values
    expect(result.current.names).toEqual(["field1[0]", "field1[1]"]);
    expect(result.current.value).toEqual(["1", "2"]);

    await act(async () => {
      result.current.actions.push("3");
    });
    // Return initial 2 names and values after adding a new item
    expect(result.current.names).toEqual([
      "field1[0]",
      "field1[1]",
      "field1[2]"
    ]);
    expect(result.current.value).toEqual(["1", "2", "3"]);

    await act(async () => {
      result.current.actions.remove(1);
    });

    // Return initial 2 names and values after removing an item
    expect(result.current.names).toEqual(["field1[0]", "field1[1]"]);
    expect(result.current.value).toEqual(["1", "3"]);
  });
});
