# JavaScript/JSX Refactoring Patterns Reference

66 patterns that reduce lines of code while preserving identical functionality.
Organized by category with before/after examples, line savings, and risk assessments.

## Priority Order (apply top-down)

1. Dead code removal — zero risk, immediate wins
2. Loop simplifications — high line savings, very safe
3. Conditional simplifications — high readability gain
4. Modern idioms — safe modernization
5. De-duplication — highest total savings but requires judgment
6. Boolean/function simplifications — small wins, mostly safe
7. React-specific — derived state elimination is high-value; prop spreading needs care

---

## 1. Loop Simplifications

### 1.1 For-loop → `map`
```js
// BEFORE (4 lines)
const names = [];
for (let i = 0; i < users.length; i++) {
  names.push(users[i].name);
}
// AFTER (1 line)
const names = users.map(u => u.name);
```
Lines saved: 3 | Risk: **safe**

### 1.2 For-loop → `filter`
```js
// BEFORE (5 lines)
const active = [];
for (const user of users) {
  if (user.isActive) {
    active.push(user);
  }
}
// AFTER (1 line)
const active = users.filter(u => u.isActive);
```
Lines saved: 4 | Risk: **safe**

### 1.3 For-loop → `find`
```js
// BEFORE (6 lines)
let found = null;
for (let i = 0; i < items.length; i++) {
  if (items[i].id === targetId) {
    found = items[i];
    break;
  }
}
// AFTER (1 line)
const found = items.find(item => item.id === targetId) ?? null;
```
Lines saved: 5 | Risk: **safe**

### 1.4 For-loop → `some` / `every`
```js
// BEFORE (6 lines)
let hasAdmin = false;
for (const user of users) {
  if (user.role === 'admin') {
    hasAdmin = true;
    break;
  }
}
// AFTER (1 line)
const hasAdmin = users.some(u => u.role === 'admin');
```
Lines saved: 5 | Risk: **safe**

### 1.5 For-loop → `reduce`
```js
// BEFORE (4 lines)
let total = 0;
for (let i = 0; i < orders.length; i++) {
  total += orders[i].amount;
}
// AFTER (1 line)
const total = orders.reduce((sum, o) => sum + o.amount, 0);
```
Lines saved: 3 | Risk: **safe**

### 1.6 Nested loops → `flatMap`
```js
// BEFORE (5 lines)
const allTags = [];
for (const post of posts) {
  for (const tag of post.tags) {
    allTags.push(tag);
  }
}
// AFTER (1 line)
const allTags = posts.flatMap(post => post.tags);
```
Lines saved: 4 | Risk: **safe**

### 1.7 Filter + Map in one pass
```js
// BEFORE (5 lines)
const results = [];
for (const item of items) {
  if (item.active) {
    results.push(item.name.toUpperCase());
  }
}
// AFTER (1 line)
const results = items.filter(i => i.active).map(i => i.name.toUpperCase());
```
Lines saved: 4 | Risk: **safe**

### 1.8 Grouping → `Object.groupBy`
```js
// BEFORE (6 lines)
const grouped = {};
for (const item of items) {
  if (!grouped[item.category]) {
    grouped[item.category] = [];
  }
  grouped[item.category].push(item);
}
// AFTER (1 line)
const grouped = Object.groupBy(items, item => item.category);
```
Lines saved: 5 | Risk: **caution** (ES2024; use reduce for broader compat)

---

## 2. Conditional Simplifications

### 2.1 Nested ifs → guard clause
```js
// BEFORE (8 lines)
function process(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return doWork(user);
      }
    }
  }
  return null;
}
// AFTER (4 lines)
function process(user) {
  if (!user || !user.isActive || !user.hasPermission) return null;
  return doWork(user);
}
```
Lines saved: 4 | Risk: **safe**

### 2.2 If/else returning booleans
```js
// BEFORE (5 lines)
if (age >= 18) {
  return true;
} else {
  return false;
}
// AFTER (1 line)
return age >= 18;
```
Lines saved: 4 | Risk: **safe**

### 2.3 If/else → ternary assignment
```js
// BEFORE (6 lines)
let label;
if (count > 0) {
  label = `${count} items`;
} else {
  label = 'No items';
}
// AFTER (1 line)
const label = count > 0 ? `${count} items` : 'No items';
```
Lines saved: 5 | Risk: **safe**

### 2.4 Null checks → optional chaining
```js
// BEFORE (3 lines)
const city = user && user.address && user.address.city
  ? user.address.city
  : 'Unknown';
// AFTER (1 line)
const city = user?.address?.city ?? 'Unknown';
```
Lines saved: 2 | Risk: **safe**

### 2.5 `||` → nullish coalescing `??`
```js
// BEFORE — bug: port 0 is falsy
const port = config.port || 3000;
// AFTER
const port = config.port ?? 3000;
```
Lines saved: 0 (bug fix) | Risk: **caution** (semantics change for `0`, `""`, `false`)

### 2.6 Logical assignment operators
```js
// BEFORE (6 lines)
if (!options.timeout) {
  options.timeout = 5000;
}
if (user.name === null || user.name === undefined) {
  user.name = 'Anonymous';
}
// AFTER (2 lines)
options.timeout ||= 5000;
user.name ??= 'Anonymous';
```
Lines saved: 4 | Risk: **caution** (`||=` vs `??=` falsy semantics)

### 2.7 Switch → object lookup
```js
// BEFORE (8 lines)
function getStatusColor(status) {
  switch (status) {
    case 'success': return 'green';
    case 'warning': return 'yellow';
    case 'error': return 'red';
    case 'info': return 'blue';
    default: return 'gray';
  }
}
// AFTER (2 lines)
const STATUS_COLORS = { success: 'green', warning: 'yellow', error: 'red', info: 'blue' };
const getStatusColor = (status) => STATUS_COLORS[status] ?? 'gray';
```
Lines saved: 6 | Risk: **safe**

### 2.8 Chained ternaries → object lookup
```js
// BEFORE
return type === 'a' ? 'Alpha' : type === 'b' ? 'Beta' : type === 'c' ? 'Charlie' : 'Unknown';
// AFTER
const LABELS = { a: 'Alpha', b: 'Beta', c: 'Charlie' };
const getLabel = (type) => LABELS[type] ?? 'Unknown';
```
Lines saved: 0-1 | Risk: **safe**

---

## 3. De-duplication

### 3.1 Repeated property access → destructuring
```js
// BEFORE
console.log(response.data.users.length);
const first = response.data.users[0];
const names = response.data.users.map(u => u.name);
// AFTER
const { users } = response.data;
console.log(users.length);
const first = users[0];
const names = users.map(u => u.name);
```
Lines saved: 0 (reduces repetition/typo risk) | Risk: **safe**

### 3.2 Repeated logic → helper function
Extract when same logic (3+ lines) appears 2+ times. Net line savings must be positive.
Lines saved: varies (5-15+ at 3 usages) | Risk: **safe**

### 3.3 Repeated try/catch → wrapper
```js
// BEFORE (20+ lines) — same try/catch around multiple fetch calls
// AFTER
async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
const getUser = (id) => fetchJSON(`/api/users/${id}`);
const getPost = (id) => fetchJSON(`/api/posts/${id}`);
```
Lines saved: 10+ | Risk: **safe**

---

## 4. Dead Code Removal

### 4.1 Unused variables
Delete any variable that is assigned but never read. Lines saved: 1 per var | Risk: **safe**

### 4.2 Unreachable code after return
Delete any code after a `return`/`throw`/`break`/`continue`. Lines saved: varies | Risk: **safe**

### 4.3 Unused imports
Remove imports not referenced in the file. Lines saved: 0-1 | Risk: **safe**

### 4.4 Redundant else after return
```js
// BEFORE (6 lines)
if (member.isPremium) {
  return 0.2;
} else {
  return 0;
}
// AFTER (3 lines)
if (member.isPremium) return 0.2;
return 0;
```
Lines saved: 3 | Risk: **safe**

### 4.5 Redundant boolean init + conditional set
```js
// BEFORE (4 lines)
let isValid = false;
if (input.length > 0) {
  isValid = true;
}
// AFTER (1 line)
const isValid = input.length > 0;
```
Lines saved: 3 | Risk: **safe**

---

## 5. Modern JS Idioms

### 5.1 Destructuring function parameters
```js
// BEFORE
function greet(user) {
  const name = user.name;
  const age = user.age;
  return `${name}, age ${age}`;
}
// AFTER
function greet({ name, age }) {
  return `${name}, age ${age}`;
}
```
Lines saved: 2 | Risk: **safe**

### 5.2 Object spread instead of `Object.assign`
```js
// BEFORE
const merged = Object.assign({}, defaults, overrides);
// AFTER
const merged = { ...defaults, ...overrides };
```
Risk: **safe**

### 5.3 Template literals instead of concatenation
```js
// BEFORE
const msg = 'Hello, ' + user.name + '! You have ' + count + ' messages.';
// AFTER
const msg = `Hello, ${user.name}! You have ${count} messages.`;
```
Risk: **safe**

### 5.4 `Object.fromEntries` transforms
```js
// BEFORE (6 lines)
const result = {};
const keys = Object.keys(obj);
for (const key of keys) {
  if (obj[key] !== null) {
    result[key] = obj[key];
  }
}
// AFTER (1 line)
const result = Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null));
```
Lines saved: 5 | Risk: **safe**

### 5.5 `Set` for unique values
```js
// BEFORE (5 lines)
const unique = [];
for (const item of arr) {
  if (!unique.includes(item)) {
    unique.push(item);
  }
}
// AFTER (1 line)
const unique = [...new Set(arr)];
```
Lines saved: 4 | Risk: **safe** (reference equality for objects)

### 5.6 `Promise.all` for independent async
```js
// BEFORE (3 lines, sequential)
const users = await fetchUsers();
const posts = await fetchPosts();
const comments = await fetchComments();
// AFTER (1 line, parallel)
const [users, posts, comments] = await Promise.all([fetchUsers(), fetchPosts(), fetchComments()]);
```
Lines saved: 2 + faster | Risk: **caution** (all reject if any rejects)

### 5.7 `Array.from` with mapping
```js
// BEFORE (4 lines)
const arr = [];
for (let i = 0; i < 10; i++) {
  arr.push(i * 2);
}
// AFTER (1 line)
const arr = Array.from({ length: 10 }, (_, i) => i * 2);
```
Lines saved: 3 | Risk: **safe**

### 5.8 Computed property names
```js
// BEFORE
const obj = {};
obj[dynamicKey] = value;
// AFTER
const obj = { [dynamicKey]: value };
```
Lines saved: 1 | Risk: **safe**

### 5.9 Shorthand property names
```js
// BEFORE
return { name: name, age: age, email: email };
// AFTER
return { name, age, email };
```
Risk: **safe**

---

## 6. React/JSX Specific

### 6.1 Unnecessary fragments
```jsx
// BEFORE — fragment wrapping single element
<><div className="container"><h1>Title</h1></div></>
// AFTER
<div className="container"><h1>Title</h1></div>
```
Lines saved: 2 | Risk: **safe**

### 6.2 Ternary with null → `&&`
```jsx
// BEFORE
{isVisible ? <Modal /> : null}
// AFTER
{isVisible && <Modal />}
```
Risk: **caution** (if `isVisible` could be `0`, renders `0`)

### 6.3 Derived state in useState → computed value
```jsx
// BEFORE (5 lines)
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(items.length);
}, [items]);
// AFTER (2 lines)
const [items, setItems] = useState([]);
const count = items.length;
```
Lines saved: 3 + eliminates extra render | Risk: **safe**

### 6.4 className conditionals → `cn()`/`clsx()`
```jsx
// BEFORE
<div className={`btn ${isActive ? 'btn-active' : ''} ${isDisabled ? 'btn-disabled' : ''}`}>
// AFTER
<div className={cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')}>
```
Risk: **safe** (requires clsx/cn import)

### 6.5 Unnecessary `useMemo` for cheap computation
```jsx
// BEFORE
const label = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
// AFTER
const label = `${firstName} ${lastName}`;
```
Risk: **caution** (only if value is cheap to compute and not a dep for memoized children)

### 6.6 Boolean prop shorthand
```jsx
// BEFORE
<Input disabled={true} readOnly={true} />
// AFTER
<Input disabled readOnly />
```
Risk: **safe**

### 6.7 Spread props for passthrough
```jsx
// BEFORE
function Button({ className, children, onClick, disabled, type }) {
  return <button className={className} onClick={onClick} disabled={disabled} type={type}>{children}</button>;
}
// AFTER
function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
```
Risk: **caution** (passes ALL props to DOM)

### 6.8 Inline handler → extracted function
When inline JSX handler exceeds 2 lines, extract to named function above JSX return.
Risk: **safe** (improves readability, avoids re-creation)

---

## 7. String/Object/Array Simplifications

### 7.1 `includes` instead of `indexOf !== -1`
```js
if (arr.indexOf(item) !== -1) → if (arr.includes(item))
```
Risk: **safe**

### 7.2 `startsWith`/`endsWith` instead of slice/regex
```js
if (filename.slice(-4) === '.pdf') → if (filename.endsWith('.pdf'))
if (/^https:/.test(url)) → if (url.startsWith('https:'))
```
Risk: **safe**

### 7.3 `Array.isArray` instead of `instanceof Array`
Risk: **safe** (more correct across realms)

### 7.4 `Object.keys().length` for empty check
```js
// BEFORE (6 lines) — for-in with hasOwnProperty
// AFTER (1 line)
const isEmpty = Object.keys(obj).length === 0;
```
Lines saved: 5 | Risk: **safe**

### 7.5 `structuredClone` instead of `JSON.parse(JSON.stringify())`
```js
const copy = JSON.parse(JSON.stringify(original));
// →
const copy = structuredClone(original);
```
Risk: **caution** (Node 17+/modern browsers only)

---

## 8. Boolean Logic

### 8.1 Simplified boolean return
```js
// BEFORE (4 lines)
if (x > 10) { return true; }
return false;
// AFTER (1 line)
return x > 10;
```
Lines saved: 3 | Risk: **safe**

### 8.2 Double negation in conditionals
```js
if (!!value) → if (value)   // always redundant in boolean context
```
Risk: **safe**

### 8.3 De Morgan's law
```js
if (!(a && b)) → if (!a || !b)
```
Risk: **safe**

### 8.4 Truthiness shorthand
```js
if (arr.length > 0) → if (arr.length)
if (str !== '') → if (str)
if (obj !== null && obj !== undefined) → if (obj != null)
```
Risk: **caution** (watch for `0`, `""`, `false` being valid values)

### 8.5 Negated empty-block flip
```js
// BEFORE (4 lines)
if (!isDisabled) {
  // nothing
} else {
  showError();
}
// AFTER (3 lines)
if (isDisabled) {
  showError();
}
```
Lines saved: 1 | Risk: **safe**

---

## 9. Function Simplifications

### 9.1 Arrow implicit return
```js
const double = (x) => { return x * 2; };
// →
const double = (x) => x * 2;
```
Lines saved: 2 | Risk: **safe**

### 9.2 Arrow implicit return with object
```js
const makeUser = (name) => { return { name, createdAt: Date.now() }; };
// →
const makeUser = (name) => ({ name, createdAt: Date.now() });
```
Lines saved: 2 | Risk: **safe**

### 9.3 Parameter defaults instead of internal checks
```js
// BEFORE
function createConfig(options) {
  const timeout = options.timeout !== undefined ? options.timeout : 3000;
  const retries = options.retries !== undefined ? options.retries : 3;
}
// AFTER
function createConfig({ timeout = 3000, retries = 3 } = {}) {}
```
Lines saved: 2 | Risk: **safe**

### 9.4 Unnecessary IIFE removal
Remove IIFE when scoping is not needed. Lines saved: 2 | Risk: **caution** (removes scope isolation)

### 9.5 Point-free callbacks
```js
items.map(item => getId(item)) → items.map(getId)
```
Risk: **caution** (fails if function uses extra args — classic `parseInt` bug)

### 9.6 Unnecessary `return await`
```js
// return await is only needed inside try/catch
async function getData() {
  return await fetch('/api').then(r => r.json()); // unnecessary await
}
```
Risk: **safe** (except inside try/catch where `return await` IS needed)

---

## 10. Import/Export Cleanup

### 10.1 Consolidate imports from same module
```js
// BEFORE (3 lines)
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
// AFTER (1 line)
import { useState, useEffect, useRef } from 'react';
```
Lines saved: 2 | Risk: **safe**

### 10.2 Named re-export
```js
// BEFORE
import { Button } from './Button';
export { Button };
// AFTER
export { Button } from './Button';
```
Lines saved: 1 | Risk: **safe** (unless import is also used locally)

---

## Bonus Patterns

### B.1 `at(-1)` instead of `arr[arr.length - 1]`
Risk: **safe** (ES2022+)

### B.2 Optional chaining on function calls
```js
if (callback) { callback(data); } → callback?.(data);
```
Lines saved: 2 | Risk: **safe**

### B.3 `??=` for defaults
```js
if (config.retries == null) { config.retries = 3; } → config.retries ??= 3;
```
Lines saved: 2 | Risk: **safe**

### B.4 `Object.hasOwn` instead of `hasOwnProperty.call`
Risk: **safe** (ES2022+)

### B.5 `replaceAll` instead of regex global
```js
str.replace(/\-/g, '_') → str.replaceAll('-', '_')
```
Risk: **safe** (ES2021+)
