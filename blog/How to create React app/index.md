---
title: 3 bước tạo mới dự án React bằng webpack
date: "2019-05-08"
authors: [anhhtus]
category: "React"
tags:
  - "React"
  - "React-DOM"
  - "Webpack"
description: "3 steps to create React app from nothing"
---

### 3 steps to create React app from nothing
#### Step 1. npm init
* Ở bước này ta tạo được một môi trường để quản lí thu viện cũng như source code của dự án
* Được biết là `React` là một thư viện để tạo giao diện (UI) được chia nhỏ thành các component bằng
code JS (Dùng JSX để viết giao diện) 
* `ReactDOM` Là thư viện được tách ra từ `React` core => mục đích nhằm tách biệt phần tạo giao diện 
với phần giao tiếp với DOM 
`ReactDOM` là lớp liên kết giữa `React` và `DOM`, VD: như muốn hiện thị component React vào một DOM
nào đó ta dùng
```javascript
ReactDOM.render(<h1>Hello, world!</h1>,document.getElementById('root'))

// hoặc để tìm DOM
ReactDOM.findDOMNode()
```
* `React-router-dom` Cơ bản React là thư viện để tạo UI cho ứng dụng nên thực chất nó không 
có Router, khi đó để có thẻ điều hướng trên một ứng dụng React ta cần dùng thư viện này
Bài viết chi tiết về `React-router-dom` sẽ được nói trong một bài viết khác

* `webpack`  

#### Step 2. Install `react` `react-dom` `react-router-dom` `webpack`
* `webpack`: là thư viện để tạo ra bundle file từ các file đầu vào js, css, resource ...
* `webpack-cli`: Từ bản v4 đươc chia ra từ webpack core, dùng để chạy webpack bằng CLI, phù hợp với 
production
* `webpack-dev-server`: thực hiện hot reload khi có bất kì thay đổi nào từ file đầu vào. Phù hợp với
qúa trình development
##### Triết lí của webpack.
1. Mọi thứ đều là module: tất cả các file html, css, js, images... đều được webpack coi là một 
module. Từ đó hoàn toàn có thể export và import nó ở bất cứ chỗ nào để dùng.
2. Chỉ load nhưng thứ cần và load khi cần thiết: Khi file bundle trở nên quá lớn thì việc
client load sẽ trở nên khó khăn và ảnh hưởng đến trải nghiệm. Như vậy webpack có một số
cơ chế để tách nhỏ file bundle thành nhiều file ứng với mục đích khác nhau.

Link ref source pure react: https://github.com/vuanhtu1993/observation-state

