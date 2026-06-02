import { FunctionComponent, PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";

import { Forma } from "../../Forma";
import { UseFormaMethods } from "../../forma-api.types";
import { useFormaSubscription } from "../index";

let actionsPersisted: UseFormaMethods<{ field1: string }> | undefined;
const Context: FunctionComponent<PropsWithChildren> = props => {
  return (
    <Forma.Provider
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSubmit={async () => {}}
      initialValues={{
        field1: "2"
      }}
      children={(state, actions) => {
        if (!actionsPersisted) {
          actionsPersisted = actions;
        }
        return (
          <>
            <input
              name="field1"
              value={state.values.field1}
              onChange={event => actions.setValue("field1", event.target.value)}
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

describe("useFormSubscription", () => {
  it("should return state, action and subscriptions", async () => {
    const { result } = renderHook(
      () => useFormaSubscription({ subscriptions: { dirty: true } }),
      {
        wrapper: Context
      }
    );

    expect(result.current?.subscriptions).toBeDefined();
    expect(result.current?.actions).toBeDefined();
    expect(result.current?.subscriptions).toBeDefined();
  });

  it("should return all subscriptions with default values if subscriptions prop has not been passed", async () => {
    const { result } = renderHook(
      () => useFormaSubscription({ subscriptions: {} }),
      {
        wrapper: Context
      }
    );

    expect(result.current?.subscriptions).toEqual([
      undefined,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
  });

  it("should return subscriptions values as string if subscribed for this", () => {
    const { result } = renderHook(
      () => useFormaSubscription({ subscriptions: { values: true } }),
      {
        wrapper: Context
      }
    );
    act(() => {
      actionsPersisted?.setValue("field1", "1");
    });
    expect(result.current?.subscriptions).toEqual([
      '{"field1":"1"}',
      false,
      false,
      false,
      false,
      false,
      false
    ]);
  });

  it("should return subscriptions dirty", async () => {
    const { result } = renderHook(
      () => useFormaSubscription({ subscriptions: { dirty: true } }),
      {
        wrapper: Context
      }
    );

    expect(result.current?.subscriptions).toEqual([
      undefined,
      false,
      false,
      false,
      false,
      false,
      false
    ]);

    act(() => {
      actionsPersisted?.registerField("field1");
      actionsPersisted?.setValue("field1", "1");
    });
    await waitFor(() => {
      expect(result.current?.subscriptions).toEqual([
        undefined,
        false,
        false,
        true, // dirty
        false,
        false,
        false
      ]);
    });
  });
});
