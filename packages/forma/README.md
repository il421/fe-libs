# @fe-libs/forma

A React form state management library providing hooks and components for field-level state tracking, validation, submission, and field arrays — powered by reducers and React Context.

## Support
If this library helped you, you can buy me a coffee:
☕️ https://buymeacoffee.com/il421

## Navigation

- [Why?](#why)
- [Requirements](#requirements)
- [Installation](#installation)
- [Module Formats](#module-formats)
  - [ESM](#esm)
  - [CommonJS](#commonjs)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Forma.Provider](#formaprovider)
  - [FormaState](#formastate)
  - [UseFormaMethods](#useformamethods)
  - [Hooks](#hooks)
    - [useFormaContext](#useformacontext)
    - [useFieldContext](#usefieldcontext)
    - [useFieldRegister](#usefieldregister)
    - [useFieldArray](#usefieldarray)
    - [useFormaSubscription](#useformasubscription)
    - [useFieldMetaSubscription](#usefieldmetasubscription)
    - [useFormaInternalValidator](#useformainternalvalidator)
  - [Components](#components)
    - [FieldController](#fieldcontroller)
    - [FieldArray](#fieldarray)
    - [FieldCondition](#fieldcondition)
    - [FieldError](#fielderror)
    - [FormaSpy](#formaspy)
    - [FieldSpy](#fieldspy)
    - [FormaValidator](#formavalidator)
- [License](#license)

## Why?

Most form libraries either own your UI completely, force a specific rendering model, or re-render the entire form on every keystroke. Forma gives you:

- 🔁 **Reducer-backed state** — all form state flows through a single predictable reducer; no hidden magic, easy to trace.
- 🎯 **Field-level granularity** — each field tracks its own `dirty`, `touched`, `modified`, `active`, and `error` state independently.
- 🧩 **Render-prop API** — `Forma.Provider`, `FieldController`, `FieldArray`, `FormaSpy`, and `FieldSpy` all use render props, so you keep full control of your markup.
- 📋 **Built-in field arrays** — push, unshift, insert, remove, update, and replace items in dynamic lists with a single method call.
- 🔍 **Subscription model** — `FormaSpy` and `FieldSpy` only re-render when the specific state slice you subscribed to actually changes.
- 🏗️ **Zero UI coupling** — works with any component library; Forma never renders an `<input>` itself.
- 🔷 **TypeScript-first** — the entire API is generic over your `FormValues` shape and custom error type.

## Requirements

- **React**: 18+
- **TypeScript**: 4.7+ (`"moduleResolution": "bundler"`, `"node16"`, or `"nodenext"` recommended)

## Installation

```bash
npm install @fe-libs/forma
# or
pnpm add @fe-libs/forma
# or
yarn add @fe-libs/forma
```

## Module Formats

This package exposes both **ESM** and **CommonJS** entry points via the package root.
Use the package name (`@fe-libs/forma`) rather than importing files from `dist` directly.

### ESM

```typescript
import { Forma, FieldController, useFormaContext } from '@fe-libs/forma';
import type { FormaState, UseFormaMethods } from '@fe-libs/forma';
```

### CommonJS

```javascript
const { Forma, FieldController, useFormaContext } = require('@fe-libs/forma');
```

> The package uses named exports. There is no default export.

## Quick Start

Wrap your form in `Forma.Provider`, supply `onSubmit` and `initialValues`, then use `FieldController` to connect each input:

```tsx
import { Forma, FieldController } from '@fe-libs/forma';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginForm = () => (
  <Forma.Provider<LoginForm>
    initialValues={{ email: '', password: '' }}
    onSubmit={async (values, { reset }) => {
      await submitToApi(values);
      reset();
    }}
  >
    {(state, actions) => (
      <form onSubmit={(e) => { e.preventDefault(); actions.submit(); }}>
        <FieldController<string> name="email">
          {({ value, setFieldValue, meta }) => (
            <div>
              <input
                value={value ?? ''}
                onChange={(e) => setFieldValue(e.target.value)}
                onFocus={() => {}}
                onBlur={() => {}}
              />
              {meta?.error && <span>{meta.error}</span>}
            </div>
          )}
        </FieldController>

        <FieldController<string> name="password">
          {({ value, setFieldValue }) => (
            <input
              type="password"
              value={value ?? ''}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          )}
        </FieldController>

        <button type="submit" disabled={state.isSubmitting || state.invalid}>
          {state.isSubmitting ? 'Submitting…' : 'Log in'}
        </button>
      </form>
    )}
  </Forma.Provider>
);
```

---

## API Reference

### `Forma.Provider`

The root component. Initialises the reducer-backed form state and provides it to all descendant hooks and components via React Context.

```typescript
<Forma.Provider<FormValues, TError>
  initialValues={...}
  onSubmit={...}
  validate={...}
  notify={...}
  isEqual={...}
  disabled={...}
  readonly={...}
>
  {(state, actions) => <YourForm />}
</Forma.Provider>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `(state: FormaState, actions: UseFormaMethods) => ReactNode` | yes | Render prop that receives the current form state and action methods. |
| `onSubmit` | `(values: FormValues, actions: { reset, setValue }) => Promise<void>` | yes | Called when `actions.submit()` is triggered and the form is valid. Receives the current values and a limited set of actions. |
| `initialValues` | `FormValues` | no | Starting values for all fields. Defaults to `{}`. |
| `validate` | `(values: FormValues) => object` | no | Synchronous validation function. Return an object whose keys are field names and values are error strings. Nested objects and arrays are supported and are flattened internally. |
| `notify` | `(args: NotifyArgs) => void` | no | Called whenever a field value changes. Receives the changed field name, its new value, a `getState` snapshot, and `setValue`/`reset` actions. |
| `isEqual` | `(prevValue: Value, value: Value) => boolean` | no | Custom equality function used by the reducer to decide whether a `setValue` call actually changed the value. Defaults to built-in deep equality. |
| `disabled` | `boolean` | no | Propagated to all `useFieldContext` consumers as `disabledForm`. |
| `readonly` | `boolean` | no | Propagated to all `useFieldContext` consumers as `readonlyForm`. |

---

### `FormaState`

The complete state object passed to the `children` render prop and available via `useFormaContext`.

```typescript
type FormaState<FormValues, TError = Error> = {
  values: FormValues;
  initialValues: FormValues;
  fields: Record<string, FieldItemBaseState>;
  dirty: boolean;
  invalid: boolean;
  isSubmitting: boolean;
  submitFailed: boolean;
  submitSucceeded: boolean;
  triedToSubmit: boolean;
  submitError: TError | undefined;
  disabled?: boolean;
  readonly?: boolean;
};
```

| Field | Description |
|-------|-------------|
| `values` | Current values of all fields. |
| `initialValues` | The values the form was initialised with (or last reset to). |
| `fields` | Per-field metadata map. Keys are field names; values are `FieldItemBaseState`. |
| `dirty` | `true` if any registered field has been modified from its initial value. |
| `invalid` | `true` if any registered field currently has an error. |
| `isSubmitting` | `true` while `onSubmit` is in flight. |
| `submitFailed` | `true` if the last `onSubmit` call threw or rejected. |
| `submitSucceeded` | `true` if the last `onSubmit` call resolved successfully. |
| `triedToSubmit` | `true` after the first `submit()` call, regardless of outcome. Used by `FieldError` to gate error display. |
| `submitError` | The error thrown by the last failed `onSubmit`, typed as `TError`. |
| `disabled` | Mirrors the `disabled` prop on `Forma.Provider`. |
| `readonly` | Mirrors the `readonly` prop on `Forma.Provider`. |

#### `FieldItemBaseState`

```typescript
type FieldItemBaseState = {
  error: string | undefined;
  active: boolean;
  dirty: boolean;
  touched: boolean;
  modified: boolean;
  registered: boolean;
};
```

| Field | Description |
|-------|-------------|
| `error` | Current validation error string, or `undefined` if the field is valid. |
| `active` | `true` while the field has focus (set via `focus()` / cleared via `blur()`). |
| `dirty` | `true` if the field's current value differs from its initial value. |
| `touched` | `true` after the field has been focused at least once. |
| `modified` | `true` after the field value has been changed at least once. |
| `registered` | `true` while the field is mounted and registered with the form. |

---

### `UseFormaMethods`

The actions object passed alongside `FormaState` to the `children` render prop and available via `useFormaContext`.

```typescript
type UseFormaMethods<FormValues extends object = object> = {
  setValue: (name: string, value: unknown) => void;
  setValues: (values: FormValues) => void;
  setError: (name: string, error: string | undefined) => void;
  reset: (values?: FormValues) => void;
  focus: (name: string) => void;
  blur: (name: string) => void;
  registerField: (name: string) => void;
  unRegisterField: (name: string) => void;
  submit: () => void;
  notify?: (args: NotifyArgs<FormValues>) => void;
  arrayMutators: FormaArrayMethods;
};
```

| Method | Description |
|--------|-------------|
| `setValue(name, value)` | Update a single field's value. Supports dot-notation and bracket-notation for nested paths (e.g., `"address.city"`, `"tags[0]"`). |
| `setValues(values)` | Replace all form values at once. |
| `setError(name, error)` | Manually set or clear (`undefined`) a field's error. |
| `reset(values?)` | Reset the form to `initialValues`, or to the provided `values` if supplied. |
| `focus(name)` | Mark a field as active (focused). |
| `blur(name)` | Mark a field as inactive and touched. |
| `registerField(name)` | Register a field with the form. Called automatically by `useFieldRegister`. |
| `unRegisterField(name)` | Remove a field from the form state. Called automatically on unmount. |
| `submit()` | Trigger form submission. Sets `triedToSubmit`, then calls `onSubmit` if the form is valid. |
| `arrayMutators` | Object containing all array mutation methods — see [`useFieldArray`](#usefieldarray). |

---

## Hooks

### `useFormaContext`

Access the raw `FormaContext` (state + actions) from any component inside `Forma.Provider`. Throws if called outside a provider.

```typescript
const useFormaContext = <FormValues extends object, TError extends Error = Error>()
  => FormaContext<FormValues, TError>
```

```tsx
const MySubmitButton = () => {
  const { state, actions } = useFormaContext<LoginForm>();
  return (
    <button onClick={actions.submit} disabled={state.invalid || state.isSubmitting}>
      Submit
    </button>
  );
};
```

---

### `useFieldContext`

Retrieve a single field's value and interaction handlers. Does not register the field — use `useFieldRegister` or `FieldController` for that.

```typescript
const useFieldContext = <Value = unknown, FormValues extends object = object>(
  name: string
) => UseFieldContextReturn<Value, FormValues>
```

#### `UseFieldContextReturn`

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Value \| undefined` | Current value of the field. |
| `values` | `FormValues` | The full form values object. |
| `meta` | `FieldItemBaseState \| undefined` | Current field metadata. |
| `setFieldValue` | `(value: Value) => void` | Update this field's value. |
| `resetFieldValue` | `() => void` | Reset this field to its initial value. |
| `focusField` | `() => void` | Mark this field as active. |
| `blurField` | `() => void` | Mark this field as inactive and touched. |
| `disabledForm` | `boolean \| undefined` | Mirrors `Forma.Provider` `disabled` prop. |
| `readonlyForm` | `boolean \| undefined` | Mirrors `Forma.Provider` `readonly` prop. |

```tsx
const EmailInput = () => {
  const { value, setFieldValue, meta } = useFieldContext<string>('email');
  return (
    <input
      value={value ?? ''}
      onChange={(e) => setFieldValue(e.target.value)}
      aria-invalid={!!meta?.error}
    />
  );
};
```

---

### `useFieldRegister`

Registers a field with the form on mount and unregisters it on unmount. Also wires up the `notify` callback for value changes. Call this in any custom field component that uses `useFieldContext` directly.

```typescript
const useFieldRegister = <Value = unknown, Values extends object = object>(
  name: string
) => void
```

```tsx
const CustomInput = ({ name }: { name: string }) => {
  useFieldRegister(name);
  const { value, setFieldValue } = useFieldContext<string>(name);
  return <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} />;
};
```

> `FieldController` and `useFieldArray` call `useFieldRegister` internally, so you do not need it when using those.

---

### `useFieldArray`

Manage a dynamic list of fields. Handles registration and provides array-specific mutators.

```typescript
const useFieldArray = <Value = unknown,>(name: string) => UseFieldArrayReturn<Value>
```

#### `UseFieldArrayReturn`

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Value[]` | Current array value. |
| `names` | `string[]` | Derived field name strings for each item, e.g. `["tags[0]", "tags[1]"]`. |
| `actions.push` | `(item: Value) => void` | Append an item to the end. |
| `actions.unshift` | `(item: Value) => void` | Prepend an item to the start. |
| `actions.remove` | `(index: number) => void` | Remove the item at the given index. |
| `actions.update` | `(index: number, item: Value) => void` | Replace the item at the given index. |
| `actions.insert` | `(index: number, item: Value) => void` | Insert an item before the given index. |
| `actions.replace` | `(items: Value[]) => void` | Replace the entire array. |

```tsx
const TagsField = () => {
  const { names, value, actions } = useFieldArray<string>('tags');
  return (
    <div>
      {names.map((name, index) => (
        <div key={name}>
          <FieldController<string> name={name}>
            {({ value, setFieldValue }) => (
              <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} />
            )}
          </FieldController>
          <button onClick={() => actions.remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => actions.push('')}>Add tag</button>
    </div>
  );
};
```

---

### `useFormaSubscription`

Subscribe to a specific subset of form-level state. The hook re-renders only when one of the subscribed values changes, making it suitable for components like submit buttons or status bars.

```typescript
const useFormaSubscription = <Values extends object = object>(props: {
  subscriptions?: FormSpySubscriptions;
}) => { subscriptions: unknown[], state: FormaState<Values>, actions: UseFormaMethods<Values> }
```

#### `FormSpySubscriptions`

```typescript
type FormSpySubscriptions = {
  invalid?: boolean;
  submitError?: boolean;
  dirty?: boolean;
  values?: boolean;
  isSubmitting?: boolean;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  triedToSubmit?: boolean;
};
```

When `subscriptions` is omitted, all keys default to `true`.

```tsx
const SubmitButton = () => {
  const { state, actions } = useFormaSubscription({
    subscriptions: { invalid: true, isSubmitting: true }
  });
  return (
    <button onClick={actions.submit} disabled={state.invalid || state.isSubmitting}>
      Submit
    </button>
  );
};
```

---

### `useFieldMetaSubscription`

Subscribe to a specific subset of a single field's metadata. Re-renders only when one of the subscribed meta keys (or the field value) changes.

```typescript
const useFieldMetaSubscription = <Value = unknown,>(props: {
  name: string;
  subscriptions?: MetaSubscriptions;
}) => { subscriptions: unknown[], value: Value | undefined, meta: FieldItemBaseState | undefined }
```

#### `MetaSubscriptions`

```typescript
type MetaSubscriptions = Partial<Record<keyof FieldItemBaseState, boolean>>;
// keys: error | active | dirty | touched | modified | registered
```

```tsx
const ErrorDisplay = ({ name }: { name: string }) => {
  const { value, meta } = useFieldMetaSubscription({
    name,
    subscriptions: { error: true, touched: true }
  });
  return meta?.touched && meta?.error ? <span>{meta.error}</span> : null;
};
```

---

### `useFormaInternalValidator`

Runs a validation function against the current form values whenever values or registered fields change, and writes errors back into each field's state via `setError`. Used internally by `FormaValidator`.

```typescript
const useFormaInternalValidator = <FormValues extends object = object, TError extends Error = Error>(
  validate: ((values: FormValues) => object) | undefined
) => void
```

The validation function may return a nested object — Forma flattens it to dot/bracket-notation keys automatically, so `{ address: { city: 'Required' } }` becomes `{ 'address.city': 'Required' }`.

```tsx
const MyValidator = () => {
  useFormaInternalValidator<LoginForm>((values) => ({
    email: !values.email ? 'Email is required' : undefined,
    password: values.password.length < 8 ? 'Min 8 characters' : undefined,
  }));
  return null;
};
```

> Prefer the [`FormaValidator`](#formavalidator) component unless you need to compose validation logic in a custom hook.

---

## Components

### `FieldController`

A render-prop component that registers a field and exposes its full context to children. The recommended way to connect a UI input to the form.

```typescript
interface FieldControllerProps<Value> {
  name: string;
  children: (context: UseFieldContextReturn<Value, object>) => React.JSX.Element;
}
```

```tsx
<FieldController<string> name="username">
  {({ value, setFieldValue, meta, focusField, blurField }) => (
    <input
      value={value ?? ''}
      onChange={(e) => setFieldValue(e.target.value)}
      onFocus={focusField}
      onBlur={blurField}
      aria-invalid={!!meta?.error}
    />
  )}
</FieldController>
```

---

### `FieldArray`

A render-prop component for managing dynamic arrays of fields. Wraps `useFieldArray`.

```typescript
interface FieldArrayProps<Value> {
  name: string;
  children: (
    names: string[],
    actions: UseFieldArrayReturn<Value>['actions'],
    value: Value[]
  ) => React.JSX.Element;
}
```

```tsx
<FieldArray<string> name="tags">
  {(names, actions, value) => (
    <div>
      {names.map((name, index) => (
        <div key={name}>
          <FieldController<string> name={name}>
            {({ value, setFieldValue }) => (
              <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} />
            )}
          </FieldController>
          <button onClick={() => actions.remove(index)}>×</button>
        </div>
      ))}
      <button onClick={() => actions.push('')}>Add</button>
    </div>
  )}
</FieldArray>
```

---

### `FieldCondition`

Conditionally renders children based on another field's current value. Accepts either a direct value to match or a predicate function.

```typescript
interface FieldConditionProp<Value> {
  when: string;
  is: Value | ((value: Value) => boolean);
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((val: Value | undefined) => React.ReactNode);
}
```

```tsx
// Show a field only when "country" equals "nz"
<FieldCondition when="country" is="nz">
  <FieldController<string> name="state">
    {({ value, setFieldValue }) => (
      <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} placeholder="State" />
    )}
  </FieldController>
</FieldCondition>

// Use a predicate for more complex logic
<FieldCondition<number> when="age" is={(val) => !!val && val >= 18}>
  <FieldController<string> name="driversLicense">
    {({ value, setFieldValue }) => (
      <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} />
    )}
  </FieldController>
</FieldCondition>
```

---

### `FieldError`

A render-prop component that observes a field's error state and controls when the error is surfaced to the user.

```typescript
interface FieldErrorProps {
  name: string;
  validateOnInitialize: boolean;
  children: (error: string | undefined) => React.ReactNode;
  hideError?: boolean;
}
```

| Prop | Description |
|------|-------------|
| `name` | The field to observe. |
| `validateOnInitialize` | If `true`, the error is shown immediately (even before the user interacts). Otherwise the error is shown only after the field has been modified and blurred, or after the first submission attempt. |
| `children` | Render function that receives the current error string (or `undefined`). |
| `hideError` | If `true`, the component renders nothing. Useful for programmatic toggle. |

```tsx
<FieldError name="email" validateOnInitialize={false}>
  {(error) => error ? <span className="error">{error}</span> : null}
</FieldError>
```

---

### `FormaSpy`

Subscribes to form-level state and re-renders only when one of the subscribed slices changes. Supports both render-prop and side-effect (`onChange`) modes.

```typescript
interface FormaSpyProps<FormValues extends object = object> {
  children?: (state: FormaState<FormValues>, actions: UseFormaMethods<FormValues>) => React.ReactNode;
  subscriptions?: FormSpySubscriptions;
  onChange?: (state: FormaState<FormValues>, actions: UseFormaMethods<FormValues>) => void;
}
```

```tsx
// Render-prop mode — re-render a status badge only when dirty or invalid changes
<FormaSpy subscriptions={{ dirty: true, invalid: true }}>
  {(state) => (
    <span>
      {state.dirty ? 'Unsaved changes' : 'Saved'}
      {state.invalid ? ' · Has errors' : ''}
    </span>
  )}
</FormaSpy>

// Side-effect mode — sync form state to an external store on every values change
<FormaSpy
  subscriptions={{ values: true }}
  onChange={(state) => externalStore.set(state.values)}
/>
```

---

### `FieldSpy`

Subscribes to a single field's value and metadata. Supports both render-prop and side-effect (`onChange`) modes.

**Render-prop variant:**

```typescript
interface FieldSpyWithChildrenProps<Value> {
  name: string;
  children: (value?: Value, meta?: FieldItemBaseState) => React.ReactNode;
  subscriptions?: Partial<Record<keyof FieldItemBaseState, boolean>>;
}
```

**Side-effect variant:**

```typescript
interface FieldSpyWithOnChangeProps<Value> {
  name: string;
  onChange: (value?: Value, meta?: FieldItemBaseState) => void;
  equal?: (newValue?: Value, oldValue?: Value) => boolean;
}
```

```tsx
// Render-prop — show a live character count
<FieldSpy<string> name="bio" subscriptions={{ error: true }}>
  {(value, meta) => (
    <div>
      <span>{(value ?? '').length} / 200</span>
      {meta?.error && <span className="error">{meta.error}</span>}
    </div>
  )}
</FieldSpy>

// Side-effect — notify an analytics service when a field changes
<FieldSpy<string>
  name="plan"
  onChange={(value) => analytics.track('plan_changed', { value })}
/>
```

---

### `FormaValidator`

A headless component that wires a validation function into the form via `useFormaInternalValidator`. Use it as a declarative alternative to passing `validate` directly to `Forma.Provider` — useful when the validation logic lives in a separate component or depends on props.

```typescript
type FormaValidatorProps<FormValues extends object = object> = {
  validate: (values: FormValues) => object;
};
```

```tsx
<Forma.Provider<SignupForm> onSubmit={handleSubmit} initialValues={initial}>
  {(state, actions) => (
    <form onSubmit={(e) => { e.preventDefault(); actions.submit(); }}>
      <FormaValidator<SignupForm>
        validate={(values) => ({
          email: !values.email ? 'Required' : undefined,
          password: values.password.length < 8 ? 'Too short' : undefined,
        })}
      />

      <FieldController<string> name="email">
        {({ value, setFieldValue }) => (
          <input value={value ?? ''} onChange={(e) => setFieldValue(e.target.value)} />
        )}
      </FieldController>

      <FieldError name="email" validateOnInitialize={false}>
        {(error) => error ? <p className="error">{error}</p> : null}
      </FieldError>

      <button type="submit">Sign up</button>
    </form>
  )}
</Forma.Provider>
```

---

## License

MIT
