import { defaultState, FormaState } from "../../forma-api.types";
import {
  ArraysMutatorsActions,
  BaseActions,
  formaArraysReducer
} from "../index";

const initialValues = { field: [] };
const state: FormaState<{ field: number[] }> = Object.freeze({
  ...defaultState,
  initialValues,
  values: initialValues
});

describe("form-arrays-reducer", () => {
  it("should push value correctly", () => {
    const result = formaArraysReducer(
      state,
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.push_item,
          value: 1,
          name: "field"
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual(initialValues);
    expect(result.values).toEqual({ field: [1] });
  });

  it("should push value correctly (nested path)", () => {
    const initialValues = { test: { field: [] } };
    const state: FormaState<{ test: { field: number[] } }> = Object.freeze({
      ...defaultState,
      initialValues,
      values: initialValues
    });

    const result = formaArraysReducer(
      state,
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.push_item,
          value: 1,
          name: "test.field"
        }
      },
      {}
    );

    const result1 = formaArraysReducer(
      result,
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.push_item,
          value: 2,
          name: "test.field"
        }
      },
      {}
    );

    expect(result1.fields["test.field"]).toEqual({
      dirty: true,
      modified: true
    });

    expect(result1.invalid).toBeFalsy();
    expect(result1.initialValues).toEqual(initialValues);
    expect(result1.values).toEqual({ test: { field: [1, 2] } });
  });

  it("should unshift value correctly", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1] }, values: { field: [1] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.unshift_item,
          value: 2,
          name: "field"
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1] });
    expect(result.values).toEqual({ field: [2, 1] });
  });

  it("should remove value correctly", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1, 2] }, values: { field: [1, 2] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.remove_item,
          index: 1,
          name: "field"
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1, 2] });
    expect(result.values).toEqual({ field: [1] });
  });

  it("should update value correctly", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1, 2] }, values: { field: [1, 2] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.update_item,
          index: 1,
          value: 3,
          name: "field"
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1, 2] });
    expect(result.values).toEqual({ field: [1, 3] });
  });

  it("should insert value correctly", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1, 2] }, values: { field: [1, 2] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.insert_item,
          index: 1,
          value: 3,
          name: "field"
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1, 2] });
    expect(result.values).toEqual({ field: [1, 3, 2] });
  });

  it("should throw an error if index is out of bounds", () => {
    // index 5
    expect(() =>
      formaArraysReducer(
        state,
        {
          type: BaseActions.set_array_mutator,
          payload: {
            type: ArraysMutatorsActions.insert_item,
            index: 5,
            value: 3,
            name: "field"
          }
        },
        {}
      )
    ).toThrow(new Error("Index out of bounds."));

    // index undefined
    expect(() =>
      formaArraysReducer(
        state,
        {
          type: BaseActions.set_array_mutator,
          payload: {
            type: ArraysMutatorsActions.insert_item,
            value: 3,
            name: "field"
          }
        },
        {}
      )
    ).toThrow(new Error("Index out of bounds."));

    // index negative
    expect(() =>
      formaArraysReducer(
        state,
        {
          type: BaseActions.set_array_mutator,
          payload: {
            type: ArraysMutatorsActions.insert_item,
            index: -1,
            value: 3,
            name: "field"
          }
        },
        {}
      )
    ).toThrow(new Error("Index out of bounds."));
  });

  it("should replace values correctly", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1, 2] }, values: { field: [1, 2] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.replace_items,
          name: "field",
          value: [3, 4]
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1, 2] });
    expect(result.values).toEqual({ field: [3, 4] });
  });

  it("should wipe out values", () => {
    const result = formaArraysReducer(
      { ...state, initialValues: { field: [1, 2] }, values: { field: [1, 2] } },
      {
        type: BaseActions.set_array_mutator,
        payload: {
          type: ArraysMutatorsActions.replace_items,
          name: "field",
          value: []
        }
      },
      {}
    );

    expect(result.fields.field).toEqual({
      dirty: true,
      modified: true
    });

    expect(result.invalid).toBeFalsy();
    expect(result.initialValues).toEqual({ field: [1, 2] });
    expect(result.values).toEqual({ field: [] });
  });
});
