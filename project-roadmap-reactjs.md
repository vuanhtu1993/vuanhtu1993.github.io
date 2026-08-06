# Progressive Project: TaskFlow - Next.js App Router Issue Tracker
## Học ReactJS v19 qua thực hành

### Project Overview
**TaskFlow** là một hệ thống quản lý công việc (như Jira/Trello) được thiết kế đặc biệt để khai thác tối đa sức mạnh của ReactJS v19 và Next.js App Router. Dự án này đủ phức tạp để làm portfolio, có đầy đủ Read/Write operations, và chứa các edge cases thực tế (dữ liệu lớn, trạng thái bất đồng bộ, error handling) để áp dụng toàn bộ kỹ thuật nâng cao trong Curriculum.

### Curriculum Mapping
| Phase | Focus | Cover Concepts | Feature Nổi Bật |
|-------|-------|----------------|-----------------|
| **Phase 0** | Internals Deep-Dive | F1-F5 | React DevTools, StrictMode |
| **Phase 1a** | Custom Hooks & Imperative DOM | C1, C5, C6, C7 | `useRef`, `useImperativeHandle`, `useLayoutEffect` |
| **Phase 1b** | State Architecture | C2, C3, C4 | `useReducer`, Context API |
| **Phase 2** | Performance Optimization | I1, I2, I6, I8 | `memo`, `useCallback`, Virtualization |
| **Phase 3** | Advanced Patterns & Error Handling | I3, I4, I5, I7, C6 | Compound Components, Suspense, ErrorBoundary |
| **Phase 4a** | Concurrent UI & Optimization | A1-A4, A8, A9 | `useTransition`, `useOptimistic` |
| **Phase 4b** | Modern Architecture & RSC | A5, A6, A7 | Server Components, `useActionState` |

---

## Phase 0: Internals Deep-Dive

### Goal (Mục tiêu)
Khởi tạo dự án, thiết lập tư duy (mental model) về cách React hoạt động bên dưới (reconciliation) trước khi viết code logic phức tạp.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| F1 | React Rendering Model | React renders, reconciliation |
| F2-F5 | Lifecycle, State, Closures, StrictMode | `<StrictMode>`, DevTools |

### Requirements (Yêu cầu tính năng)
1. **Khởi tạo:** Tạo Next.js App Router project rỗng, cấu hình ESLint Strict Mode.
2. **Mental Model Check:** Không yêu cầu viết code tính năng. Người học cần tự vẽ lại vòng đời render của một component.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Project chạy được với `npm run dev` không có warning.
- [ ] Hoàn thành deliverable: Build a Markdown diagram/cheatsheet mô tả quá trình render.

---

## Phase 1a: Custom Hooks & Imperative DOM

### Goal (Mục tiêu)
Xây dựng các UI primitives tái sử dụng được (Modal, Form) bằng cách đóng gói logic vào custom hooks và phơi bày imperative API một cách an toàn.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| C1 | Custom Hooks | `useDebugValue` |
| C5 | useRef & Imperative DOM | `useRef`, `forwardRef`, `useImperativeHandle` |
| C7 | useLayoutEffect | `useLayoutEffect` |

### Requirements (Yêu cầu tính năng)
1. **Modal Component:** Xây dựng một UI Modal cho việc tạo Task mới. Parent component không cần quản lý state `isOpen` bằng props, thay vào đó gọi `modalRef.current.open()`.
2. **Form Hook:** Tạo custom hook `useFormState` để quản lý validation (tiêu đề không được trống, mô tả > 10 ký tự).
3. **DOM Measurement:** Nếu Modal có dynamic height, sử dụng hook phù hợp để tính toán vị trí trước khi browser paint để tránh UI bị giật (flicker).

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Modal mở/đóng thông qua `ref` từ component cha.
- [ ] Form báo lỗi ngay lập tức khi nhập sai quy tắc (sử dụng custom hook).
- [ ] UI không bị giật/nháy khi Modal xuất hiện.

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// components/TaskModal.jsx

// WHY: Dùng forwardRef để parent có thể attach ref vào component này
const TaskModal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalDOMRef = useRef(null);

  // WHY: Chỉ phơi bày chính xác những API cần thiết (open/close) thay vì toàn bộ DOM node
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  // WHY: Tính toán vị trí đồng bộ trước khi paint để tránh Modal bị giật
  useLayoutEffect(() => {
    if (isOpen && modalDOMRef.current) {
      // Logic đo đạc và set style position...
    }
  }, [isOpen]);

  return isOpen ? <div ref={modalDOMRef}>Modal Content</div> : null;
});
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Lạm dụng `useImperativeHandle` | Quen với OOP, muốn gọi method thay vì truyền props | Chỉ dùng khi props declarative (như `isOpen`) không thể giải quyết hoặc quá cồng kềnh. |
| 2 | Code nặng trong `useLayoutEffect` | Muốn đồng bộ UI mọi lúc | Nó block browser paint. Chỉ dùng khi thực sự cần đo đạc DOM để tránh flicker. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Imperative Handle | Exposing a custom ref handle | https://react.dev/reference/react/useImperativeHandle |
| 2 | Custom Hooks | Reusing Logic with Custom Hooks | https://react.dev/learn/reusing-logic-with-custom-hooks |

---

## Phase 1b: State Architecture

### Goal (Mục tiêu)
Thiết lập Global State an toàn, hiệu năng cao để quản lý các Toast Notifications (thông báo thành công/lỗi khi thao tác với Task).

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| C2 | useReducer for Complex State | `useReducer` |
| C3 | Context API at Scale | `createContext`, `useContext` |
| C4 | Reducer + Context Pattern | Kết hợp Reducer và Context |

### Requirements (Yêu cầu tính năng)
1. **Toast System:** Xây dựng hệ thống hiển thị thông báo góc màn hình.
2. **State Logic:** Sử dụng Reducer để quản lý mảng các toasts (add, remove).
3. **Provider:** Cung cấp state này cho toàn bộ app mà không gây re-render hàng loạt các component không liên quan khi có Toast mới.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Bấm tạo Task thành công → Hiện Toast notification ở góc màn hình.
- [ ] Toast tự động biến mất sau 3s (dispatch action remove).
- [ ] Component trigger Toast KHÔNG bị re-render khi danh sách Toast thay đổi (kiểm tra bằng Profiler).

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// contexts/ToastContext.jsx

// WHY: Tách riêng State Context và Dispatch Context để tránh cascading re-renders
const ToastStateContext = createContext([]);
const ToastDispatchContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  // WHY: Dispatch từ useReducer luôn ổn định (stable), không cần memoize
  return (
    <ToastDispatchContext.Provider value={dispatch}>
      <ToastStateContext.Provider value={toasts}>
        {children}
      </ToastStateContext.Provider>
    </ToastDispatchContext.Provider>
  );
};
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Single Context Object | Gộp `{ state, dispatch }` vào một `value` prop | Tách thành 2 Contexts (State và Dispatch) hoặc wrap value bằng `useMemo`. |
| 2 | Đặt Provider quá cao | Tiện tay bọc toàn bộ App bằng đủ loại Provider | Chỉ bọc những subtree thực sự cần state đó. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Reducer + Context | Scaling Up with Reducer and Context | https://react.dev/learn/scaling-up-with-reducer-and-context |

---

## Phase 2: Performance Optimization

### Goal (Mục tiêu)
Xử lý bài toán danh sách dữ liệu cực lớn (massive backlog) và tối ưu hóa re-render bằng các kỹ thuật Memoization và Virtualization.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| I1 | Memoization Strategy | `React.memo`, `useMemo`, `useCallback` |
| I8 | List Virtualization | Thư viện ảo hóa (react-window) |

### Requirements (Yêu cầu tính năng)
1. **Backlog View:** Hiển thị 10,000 tasks giả lập.
2. **Virtualization:** Sử dụng thư viện ảo hóa để DOM chỉ chứa những task đang hiển thị trên màn hình.
3. **Memoization:** Tối ưu hóa component `TaskRow` để khi click "Chọn" một task, các task khác không bị re-render.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Cuộn qua 10,000 tasks không bị giật lag (đảm bảo DOM nodes < 50).
- [ ] Khi tương tác với một `TaskRow`, Profiler hiển thị các dòng khác có màu xám (Bypassed re-render).
- [ ] Các props truyền vào `TaskRow` (như event handler) được giữ stable reference.

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// components/TaskBacklog.jsx

// WHY: Dùng React.memo để Row không re-render nếu data không đổi
const TaskRow = memo(({ data, index, style }) => {
  const { tasks, onTaskClick } = data;
  const task = tasks[index];
  return <div style={style} onClick={() => onTaskClick(task.id)}>{task.title}</div>;
});

export const TaskBacklog = ({ tasks }) => {
  // WHY: Dùng useCallback để function reference ổn định
  const handleTaskClick = useCallback((id) => console.log(id), []);

  // WHY: Object data truyền vào virtualized list cần stable reference
  const itemData = useMemo(() => ({
    tasks,
    onTaskClick: handleTaskClick
  }), [tasks, handleTaskClick]);

  return (
    <FixedSizeList itemData={itemData} itemCount={tasks.length}>
      {TaskRow}
    </FixedSizeList>
  );
};
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Truyền Inline Object/Function | Viết `<Row onClick={() => ...}/>` | Dùng `useCallback` và `useMemo` cho props truyền vào memoized component. |
| 2 | Over-memoization | Bọc mọi component bằng `React.memo` | Chỉ dùng khi component nặng và thực sự có vấn đề về performance. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Memoization | memo API reference | https://react.dev/reference/react/memo |

---

## Phase 3: Advanced Patterns & Error Handling

### Goal (Mục tiêu)
Thiết kế Panel chi tiết Task linh hoạt với Compound Components và xử lý an toàn quá trình load dữ liệu với Suspense/ErrorBoundary.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| I3 | Suspense for Data | `<Suspense>` |
| I4 | Compound Components | Context pattern |
| I7 | Error Boundaries | `<ErrorBoundary>` |

### Requirements (Yêu cầu tính năng)
1. **Tabs Library:** Tạo bộ component `<Tabs>` cho Panel chi tiết Task (Tab: Info, Comments, History) dùng Compound Components.
2. **Lazy Data:** Tab Comments chỉ tải dữ liệu khi user click vào tab đó (tích hợp data fetching hỗ trợ Suspense).
3. **Graceful Failure:** Nếu API Comments sập, chỉ Tab Comments báo lỗi, phần còn lại của màn hình vẫn hoạt động.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] API Compound Component hoạt động: `<Tabs> <Tabs.Tab> <Tabs.Panel> </Tabs>`.
- [ ] Tab Comments hiển thị Skeleton (fallback của Suspense) trong lúc fetch data.
- [ ] Mô phỏng lỗi API → Hiện UI ErrorBoundary riêng lẻ, không crash cả app.

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// components/TaskDetails.jsx

// WHY: ErrorBoundary bọc ngoài cùng để bắt lỗi render/data fetching
<ErrorBoundary fallback={<ErrorAlert />}>
  {/* WHY: Suspense catch promise từ component con để hiển thị loading */}
  <Suspense fallback={<CommentsSkeleton />}>
    {/* WHY: Compound Components giúp API declarative, tự chia sẻ state (activeTab) */}
    <Tabs defaultTab="info">
      <Tabs.List>
        <Tabs.Tab value="info">Info</Tabs.Tab>
        <Tabs.Tab value="comments">Comments</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panel value="info"><TaskInfo /></Tabs.Panel>
      <Tabs.Panel value="comments"><TaskCommentsLazy /></Tabs.Panel>
    </Tabs>
  </Suspense>
</ErrorBoundary>
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Suspense chui rúc quá cao | Đặt 1 Suspense bọc toàn bộ Page | Trang sẽ trắng tinh vì một API nhỏ. Cần chia nhỏ Suspense boundaries. |
| 2 | Lỗi Event Handler | Tưởng ErrorBoundary bắt được mọi lỗi | Nó không bắt lỗi async hay onClick. Dùng try/catch truyền thống cho event handler. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Suspense | Displaying a fallback while content is loading | https://react.dev/reference/react/Suspense |

---

## Phase 4a: Concurrent UI & Optimization

### Goal (Mục tiêu)
Mang lại trải nghiệm mượt mà ngay cả với thao tác nặng thông qua các API Concurrent của React.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| A1-A2 | Concurrent & Transition | `useTransition` |
| A4 | Optimistic UI | `useOptimistic` |

### Requirements (Yêu cầu tính năng)
1. **Responsive Search:** Ô tìm kiếm task. Khi user gõ, input phải nhận phím ngay lập tức, trong khi list kết quả lọc có thể bị trễ một chút (hiển thị UI mờ/loading).
2. **Instant Star/Upvote:** Nút gắn cờ quan trọng cho task. Bấm vào là đổi màu ngay lập tức, ngầm gọi API phía sau. Nếu API lỗi, tự revert lại màu cũ.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Gõ liên tục vào ô search không bị khựng bàn phím, list kết quả có trạng thái `isPending`.
- [ ] Bấm Star task → UI update tức thì → Network delay 2s mới xong → UI giữ nguyên nếu thành công, revert nếu lỗi.

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// components/TaskItem.jsx

const TaskItem = ({ task, onToggleStar }) => {
  // WHY: Dùng useOptimistic để tạm thời fake UI trước khi server trả kết quả
  const [optimisticTask, addOptimisticUpdate] = useOptimistic(
    task,
    (state, optimisticValue) => ({ ...state, isStarred: optimisticValue })
  );

  const handleStarClick = async () => {
    // 1. Cập nhật UI ngay lập tức
    addOptimisticUpdate(!task.isStarred);
    // 2. Gọi hàm async thực sự (kết hợp với Server Action hoặc useTransition)
    await onToggleStar(task.id);
  };

  return <button onClick={handleStarClick}>{optimisticTask.isStarred ? '★' : '☆'}</button>;
};
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Block input render | Wrap state của ô input vào `startTransition` | Khóa input state. Chỉ wrap cái state DÙNG để render kết quả nặng. |
| 2 | Optimistic quá phức tạp | Cố gắng fake data cho logic nhiều bước | Chỉ dùng cho các tương tác toggle/đơn giản. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Transitions | Marking a state update as a non-blocking transition | https://react.dev/reference/react/useTransition |

---

## Phase 4b: Modern Architecture & Server Components

### Goal (Mục tiêu)
Hiểu rõ kiến trúc App Router, phân định ranh giới Client/Server Component và xử lý forms một cách hiện đại.

### Curriculum Mapping
| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| A5 | React Server Components | `"use client"`, `"use server"` |
| A6 | Form Actions | `useActionState` |

### Requirements (Yêu cầu tính năng)
1. **Server Fetching:** Layout trang chủ của TaskFlow phải fetch dữ liệu backlog trực tiếp trên server, truyền initial data xuống cho client.
2. **Modern Form:** Form "Tạo Task" sử dụng `useActionState` để gửi data lên Server Action. Xử lý trạng thái pending và error do server trả về mà không cần dùng `useState` thủ công.

### Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Dữ liệu initial của task list được render ngay trong HTML source (Server Component).
- [ ] Bấm nút submit form "Tạo Task" → Nút tự động chuyển trạng thái loading (thông qua `isPending` của hook).
- [ ] Form nhận và hiển thị error message trả về từ Server Action (nếu title trùng).

### Conclusion

#### Pseudo Code (Best Practice)
```javascript
// app/actions.ts
"use server"
export async function createTask(prevState, formData) {
  // Logic validate và lưu DB...
  return { error: 'Tên task đã tồn tại' };
}

// components/CreateTaskForm.jsx
"use client"
// WHY: Hook này tự động track trạng thái pending và kết nối với Server Action
import { useActionState } from 'react';
import { createTask } from '../app/actions';

export const CreateTaskForm = () => {
  const [state, formAction, isPending] = useActionState(createTask, null);

  // WHY: Pass trực tiếp action vào thẻ form
  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={isPending}>{isPending ? 'Creating...' : 'Create'}</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
};
```

#### Common Pitfalls
| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | Dùng Hook trong Server Component | Quen tay dùng `useActionState` ở mọi nơi | Mọi React Hooks chỉ hoạt động trong Client Component (có `"use client"`). |
| 2 | Truyền function qua ranh giới | Pass callback từ Server xuống Client Component | Chỉ truyền được dữ liệu serializable (JSON). Nếu cần gọi hàm, dùng Server Action. |

#### Docs Navigation Guide
| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | Server Components | Server Components vs Client Components | https://react.dev/reference/rsc/server-components |
| 2 | Action State | Handling form submission state | https://react.dev/reference/react/useActionState |

---

## Summary
| Phase | Concepts Mastered | Key Features Utilized | Core Takeaway |
|---|---|---|---|
| 0 | React Internals | StrictMode | Hiểu rõ cơ chế Reconciliation. |
| 1a | Custom Hooks | useRef, useLayoutEffect | Đóng gói logic, expose imperative API an toàn. |
| 1b | Global State | useReducer, Context | Tách Context để tối ưu re-render. |
| 2 | Memoization | memo, Virtualization | Xử lý UI với data khổng lồ (10k items). |
| 3 | Advanced UI | Suspense, Compound Components | Xây dựng component linh hoạt, an toàn với lỗi. |
| 4a | Concurrent | useTransition, useOptimistic | UI mượt mà, UX cực cao nhờ phản hồi tức thì. |
| 4b | RSC | Server Components, ActionState| Kiến trúc Server-first, quản lý Form hiện đại. |

*Made by Anh Tu - Share to be share*
