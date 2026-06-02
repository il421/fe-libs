import {
  blur,
  focus,
  insertArrayItem,
  pushArrayItem,
  registerField,
  removeArrayItem,
  replaceArrayItems,
  reset,
  setError,
  setValue,
  setValues,
  submit,
  unRegisterField,
  unshiftArrayItem,
  updateArrayItem
} from "./actions";
import { createFormaContext } from "./forma-context";
import { formaReducer } from "./reducers";

export const Forma = createFormaContext(formaReducer, {
  setValue,
  setValues,
  focus,
  blur,
  reset,
  registerField,
  unRegisterField,
  submit,
  setError,
  arrayMutators: dispatch => ({
    push: pushArrayItem(dispatch),
    unshift: unshiftArrayItem(dispatch),
    remove: removeArrayItem(dispatch),
    update: updateArrayItem(dispatch),
    insert: insertArrayItem(dispatch),
    replace: replaceArrayItems(dispatch)
  })
});
