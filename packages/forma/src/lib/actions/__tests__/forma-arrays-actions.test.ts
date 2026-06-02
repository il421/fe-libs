import {
  insertArrayItem,
  pushArrayItem,
  removeArrayItem,
  replaceArrayItems,
  unshiftArrayItem,
  updateArrayItem
} from "../index";
import { ArraysMutatorsActions, BaseActions } from "../../reducers";

describe("form-arrays-actions", () => {
  it("pushArrayItem should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    pushArrayItem(dispatch)("field1", { a: 1 });
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.push_item,
        value: { a: 1 },
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });

  it("unshiftArrayItem should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    unshiftArrayItem(dispatch)("field1", {
      a: 2
    });

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.unshift_item,
        value: { a: 2 },
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });

  it("removeArrayItem should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    removeArrayItem(dispatch)("field1", 1);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.remove_item,
        index: 1,
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });

  it("updateArrayItem should dispatch correct type and payload", () => {
    const dispatch = vi.fn();
    updateArrayItem(dispatch)("field1", 1, { a: 3 });
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.update_item,
        index: 1,
        value: { a: 3 },
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });

  it("insertArrayItem should insert item into array by index", () => {
    const dispatch = vi.fn();
    insertArrayItem(dispatch)("field1", 1, { a: 3 });
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.insert_item,
        index: 1,
        value: { a: 3 },
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });

  it("replaceArrayItems should replace items", () => {
    const dispatch = vi.fn();
    replaceArrayItems(dispatch)("field1", [{ a: 3 }]);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        type: ArraysMutatorsActions.replace_items,
        value: [{ a: 3 }],
        name: "field1"
      },
      type: BaseActions.set_array_mutator
    });
  });
});
