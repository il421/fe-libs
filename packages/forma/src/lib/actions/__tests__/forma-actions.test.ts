import {
  blur,
  focus,
  registerField,
  reset,
  setMeta,
  setValue,
  setValues,
  submit,
  unRegisterField
} from "../index";
import { defaultState } from "../../forma-api.types";
import { BaseActions } from "../../reducers";

describe("form-actions", () => {
  it("setValue should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    setValue(dispatch)("field1", "test2");
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        value: "test2",
        name: "field1"
      },
      type: BaseActions.set_value
    });
  });

  it("setValues should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    setValues(dispatch)({ field1: "updatedValuesField1", field2: false });
    expect(dispatch).toHaveBeenCalledWith({
      payload: { field1: "updatedValuesField1", field2: false },
      type: BaseActions.set_values
    });
  });

  it("reset should dispatch correct type and undefined payload", () => {
    const dispatch = vi.fn();
    reset(dispatch)();
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined,
      type: BaseActions.reset_values
    });
  });

  it("reset should dispatch correct type and correct payload", () => {
    const dispatch = vi.fn();
    reset(dispatch)(defaultState);
    expect(dispatch).toHaveBeenCalledWith({
      payload: defaultState,
      type: BaseActions.reset_values
    });
  });

  it("focus should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    focus(dispatch)("field1");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { name: "field1", active: true },
      type: "set_active"
    });
  });

  it("blur should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    blur(dispatch)("field1");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { name: "field1", active: false },
      type: BaseActions.set_active
    });
  });

  it("registerField should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    registerField(dispatch)("field3");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { name: "field3" },
      type: BaseActions.register_field
    });
  });

  it("unRegisterField should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    unRegisterField(dispatch)("field3");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { name: "field3", shouldUnregister: true },
      type: BaseActions.register_field
    });
  });

  it("registerField should not dispatch correct type and payload if the field has been registered already", () => {
    const dispatch = vi.fn();
    registerField(dispatch)("field3");
    expect(dispatch).not.toHaveBeenCalledWith();
  });

  it("submit should dispatch (set_submitting, set_tried_to_submit) correct type and call onSubmit callback with submitting values", async () => {
    const dispatch = vi.fn();
    await submit(dispatch)();

    expect(dispatch).toHaveBeenCalledWith({
      payload: true,
      type: BaseActions.set_submitting
    });
    expect(dispatch).toHaveBeenCalledWith({
      payload: true,
      type: BaseActions.set_tried_to_submit
    });
  });

  it("setMeta should dispatch correct type and correct payload", () => {
    const dispatch = vi.fn();
    setMeta(dispatch, { disabled: true, readonly: true });
    expect(dispatch).toHaveBeenCalledWith({
      payload: { disabled: true, readonly: true },
      type: BaseActions.set_meta
    });
  });
});
