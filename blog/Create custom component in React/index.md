---
title: Làm sao để customize HTML Element trong React
date: "2019-05-24"
authors: [anhhtus]
category: "React"
tags:
  - "React"
  - "Component"
  - "Refs"
description: "How to actually understand the way to create React component"
---

## Ý tưởng chính của component

* Component nên được tạo nên từ các thành phần nhỏ nhất là các component nhỏ hơn nữa được custom từ DOM của HTML, 
tuy nhiên được custom theo từng UI
Ví dụ dưới đây là component được custom từ input: Ở đây sự dụng component custom như là một Node của HTML 
tuy nhiên có thể style theo từ dự án 

```javascript
import React from "react";

const Input = (props) => {
  return (
    <>
      <input placeholder="Custom input" {...props}/>
    </>
  )
}

export default Input;
```

#### Các cách để tạo ra một basis 

##### 1. Sử dựng Style component
- Có thể dựng component, truyền props để xây dựng UI 

```javascript
import styled from 'style-component'

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${props => props.primary ? "palevioletred" : "white"};
  color: ${props => props.primary ? "white" : "palevioletred"};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

render(
  <div>
    <Button>Normal</Button>
    <Button primary>Primary</Button>
  </div>
);
```

##### 2. Sử dụng REF => Can thiệp sâu hơn vào API của DOM 
* Như là ở một article nào đó tôi đã nói kĩ về refs, và các cách để ứng dụng refs vào một component.
Ứng dụng của refs là rất thực tiễn cho các component nhỏ, cần can thiệp sâu vào các API của element DOM ví dụ như: focus(),
blur(), click(), select(), setSelectionRange(), setRangeText() setCustomValidity(), checkValidity(), reportValidity() 

>Create component
```javascript
export default class InputClass extends React.Component {
  state = {
    test: "test"
  }
  showLog = () => {
    console.log("show log");
  };
  render() {
    return (
      <>
        <div>Class input component</div>
        <div>Test: {this.state.test}</div>
        <input placeholder="class input" />
      </>
    );
  }
}

const InputRef = React.forwardRef((props, ref) => (
    <>
      <div>Custom input component using forward re</div>
      <input placeholder="custom ref input" ref={ref} {...props}/>
    </>
  ))

```

>Using
```javascript
function App() {
  let customRefInput = React.createRef();
  let classInput = React.createRef();
  const [inputValue, setInputValue] = useState("");
  return (
    <div className="App">
      <h1>Hello React 17</h1>
      <h2>Start learing REF react</h2>
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        ref={node => console.log("input 1", node)}
      />
      <InputRef ref={node => (customRefInput = node)} />
      <InputClass ref={node => (classInput = node)} />
      <div>
        <button onClick={() => customRefInput.focus()}>Focus</button>
        <button onClick={() => customRefInput.blur()}>Blur</button>
        <button onClick={() => classInput.setState({ test: "test" })}>
          Reset state
        </button>
        <button onClick={() => classInput.setState({ test: "Change test" })}>
          Set state
        </button>
      </div>
    </div>
  );
}
```