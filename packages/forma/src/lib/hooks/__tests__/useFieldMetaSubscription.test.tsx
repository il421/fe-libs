import { FunctionComponent, PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";

import { Forma } from "../../Forma";
import { FormaState, UseFormaMethods } from "../../forma-api.types";
import { useFieldMetaSubscription } from "../index";

interface FormValues {
  field1: string;
}
let actionsPersisted: UseFormaMethods<FormValues> | undefined;
let statePersisted: FormaState<FormValues> | undefined;
const Context: FunctionComponent<PropsWithChildren> = props => {
  return (
    <Forma.Provider<FormValues>
      onSubmit={async () => undefined}
      initialValues={{
        field1: "1"
      }}
      children={(state, actions) => {
        if (!actionsPersisted) {
          actionsPersisted = actions;
          statePersisted = state;
        }
        return (
          <>
            <input
              name="field1"
              value={state.values["field1"]}
              onChange={evt => {
                actions.setValue("field1", evt.target.value);
              }}
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

describe("useFieldMetaSubscription", () => {
  it("should return meta, value and subscription with value only", async () => {
    const { result } = renderHook(
      () => useFieldMetaSubscription({ name: "field1" }),
      {
        wrapper: Context
      }
    );

    act(() => {
      if (!statePersisted?.fields["field1"]) {
        actionsPersisted?.registerField("field1");
      }
    });

    await waitFor(() => {
      expect(result.current?.value).toBe("1");
      expect(result.current?.subscriptions).toEqual(["1"]);
      expect(result.current?.meta).toBeDefined();
    });
  });

  it("should return subscriptions correctly", async () => {
    const { result } = renderHook(
      () =>
        useFieldMetaSubscription({
          name: "field1",
          subscriptions: { active: true }
        }),
      {
        wrapper: Context
      }
    );

    await act(async () => {
      if (!statePersisted?.fields["field1"]) {
        actionsPersisted?.registerField("field1");
        actionsPersisted?.focus("field1");
      }
    });

    await waitFor(() => {
      expect(result.current?.subscriptions).toEqual([
        "1",
        true, // is active
        false,
        false,
        false,
        false
      ]);
    });

    await act(async () => {
      actionsPersisted?.blur("field1");
    });
    await waitFor(() => {
      expect(result.current?.subscriptions).toEqual([
        "1",
        false, // is not active
        false,
        false,
        false,
        false
      ]);
    });
  });
});
