import {
  defaultFieldState,
  defaultState,
  FormaState
} from "../../forma-api.types";
import { BaseActions, formaReducer } from "../index";

const initialValues = { field1: "test", field2: true };
const state: FormaState<{ field1: string; field2: boolean }> = Object.freeze({
  ...defaultState,
  initialValues,
  values: initialValues
});

describe("form-reducer", () => {
  it("should set value correctly including field and form state", () => {
    const result = formaReducer()(state, {
      type: BaseActions.set_value,
      payload: { value: "test1", name: "field1" }
    });

    expect(result.fields.field1).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.dirty).toBeFalsy(); // since the field is still unregistered
    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual(initialValues);
    expect(result.values).toEqual({ field1: "test1", field2: true });
  });

  it("should set value correctly if value is nested object", () => {
    const initialValues = {
      field1: { arr1: [{ field2: { arr2: [{ value: "" }] } }] }
    };

    const state = Object.freeze({
      ...defaultState,
      initialValues,
      values: initialValues
    });

    const result = formaReducer<typeof initialValues>()(state, {
      type: BaseActions.set_value,
      payload: {
        value: "test1",
        name: "field1.arr1[0].field2.arr2[0].value"
      }
    });

    expect(result.values.field1.arr1[0].field2.arr2[0].value).toBe("test1");
  });

  it("should set values correctly including field and form state", () => {
    const result = formaReducer()(state, {
      type: BaseActions.set_values,
      payload: { field1: "updatedValuesField1", field2: false }
    });

    expect(result.fields.field1).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.fields.field2).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.dirty).toBeFalsy();
    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual(initialValues);
    expect(result.values).toEqual({
      field1: "updatedValuesField1",
      field2: false
    });
  });

  it("should register field with defaults state", () => {
    const result = formaReducer()(state, {
      type: BaseActions.register_field,
      payload: { name: "field1" }
    });

    expect(result.fields.field1).toEqual(defaultFieldState);
  });

  it("should register field if one has been un-register previously", () => {
    const resultFromRegister = formaReducer()(state, {
      type: BaseActions.register_field,
      payload: { name: "field1" }
    });

    expect(resultFromRegister.fields.field1).toEqual(defaultFieldState);

    const resultFromUnRegister = formaReducer()(resultFromRegister, {
      type: BaseActions.register_field,
      payload: { name: "field1", shouldUnregister: true }
    });

    expect(resultFromUnRegister.fields.field1).toEqual({
      ...defaultFieldState,
      registered: false
    });

    const resultFromAfterRegister = formaReducer()(resultFromUnRegister, {
      type: BaseActions.register_field,
      payload: { name: "field1" }
    });

    expect(resultFromAfterRegister.fields.field1).toEqual(defaultFieldState);
  });

  it("should unregister field with correct state", () => {
    const resultFromRegister = formaReducer()(state, {
      type: BaseActions.register_field,
      payload: { name: "field1" }
    });

    // check for default state after field register
    expect(resultFromRegister.fields.field1).toEqual(defaultFieldState);

    const resultFromSet = formaReducer()(resultFromRegister, {
      type: BaseActions.set_value,
      payload: { name: "field1", value: "1" }
    });

    // check for dirty and modified states
    expect(resultFromSet.fields.field1).toEqual({
      ...defaultFieldState,
      dirty: true,
      modified: true
    });

    const resultFromError = formaReducer()(resultFromSet, {
      type: BaseActions.set_error,
      payload: { name: "field1", error: "1" }
    });

    // check for error
    expect(resultFromError.fields.field1).toEqual({
      ...defaultFieldState,
      dirty: true,
      modified: true,
      error: "1"
    });

    const resultFromUnregister = formaReducer()(resultFromError, {
      type: BaseActions.register_field,
      payload: { name: "field1", shouldUnregister: true }
    });

    // check for registered, all other states and value are kept
    expect(resultFromUnregister.fields.field1).toEqual({
      ...defaultFieldState,
      dirty: true,
      modified: true,
      error: "1",
      registered: false
    });
    expect(resultFromUnregister.values["field1"]).toBe("1");
  });

  it("should name field to be active", () => {
    const result = formaReducer()(state, {
      type: BaseActions.set_active,
      payload: { name: "field1", active: true }
    });

    expect(result.fields.field1.active).toBeTruthy();
  });

  it("should set a field error and make form to be invalid", () => {
    const result = formaReducer()(state, {
      type: BaseActions.set_error,
      payload: { name: "field1", error: "error" }
    });

    expect(result.fields.field1.error).toBe("error");
    expect(result.invalid).toBeTruthy();
  });

  it("should reset form state", () => {
    const result = formaReducer()(state, {
      type: BaseActions.reset_values,
      payload: undefined
    });

    expect(result).toEqual(state);
  });

  it("should set submit succeeded as true", () => {
    const preState = { ...state, isSubmitting: true, submitFailed: true };
    const result = formaReducer()(preState, {
      type: BaseActions.set_submit_succeeded,
      payload: true
    });

    expect(result).toEqual({
      ...preState,
      submitSucceeded: true,
      submitFailed: false,
      isSubmitting: false
    });
  });

  it("should set submit tried as true", () => {
    const preState = {
      ...state,
      triedToSubmit: false
    };

    const result = formaReducer()(preState, {
      type: BaseActions.set_tried_to_submit,
      payload: true
    });

    expect(result).toEqual({
      ...preState,
      triedToSubmit: true
    });
  });

  it("should set isSubmitting as true", () => {
    const preState = {
      ...state,
      isSubmitting: false
    };

    const result = formaReducer()(preState, {
      type: BaseActions.set_submitting,
      payload: true
    });

    expect(result).toEqual({
      ...preState,
      isSubmitting: true
    });
  });

  it("should set submitError, isSubmitting and submitFailed correctly", () => {
    const preState = {
      ...state,
      submitFailed: false,
      isSubmitting: true,
      submitError: undefined
    };

    const result = formaReducer()(preState, {
      type: BaseActions.set_submit_failed,
      payload: Error("Error")
    });

    expect(result).toEqual({
      ...preState,
      submitFailed: true,
      isSubmitting: false,
      submitError: Error("Error")
    });
  });

  it("should override the default shallow values comparison", () => {
    const preState = {
      ...state,
      submitFailed: false,
      isSubmitting: true,
      submitError: undefined
    };

    const resultFromRegister = formaReducer(() => false)(preState, {
      type: BaseActions.register_field,
      payload: { name: "field1" }
    });

    const result = formaReducer(() => false)(resultFromRegister, {
      type: BaseActions.set_value,
      payload: { name: "field1", value: "test" }
    });

    expect(result.dirty).toBeTruthy(); // not it is dirty even the value we set is executable the same
  });

  it("should set FormMeta ", () => {
    const preState = {
      ...state,
      isSubmitting: false
    };

    expect(preState.readonly).toBeUndefined();
    expect(preState.disabled).toBeUndefined();

    const result = formaReducer()(preState, {
      type: BaseActions.set_meta,
      payload: { disabled: true, readonly: true }
    });

    expect(result.readonly).toBeTruthy();
    expect(result.disabled).toBeTruthy();
  });
});
