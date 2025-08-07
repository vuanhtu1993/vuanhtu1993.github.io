---
title: Webpack and style-loader for React developer
date: "2019-03-10"
category: "React"
authors: [anhhtus]
tags:
  - "React"
  - "Web Development"
  - "Webpack"
description: "More understanding about webpack, especially style-loader, why we need to use them"
---

## Webpack là gì ? 
- Chắc hẳn bạn là người mới làm quen với front-end sử dụng các library hoặc framework js sẽ thường có các câu hỏi
như là nó để làm gì, taị sao phải phức tạp nó ên như thế...
- Definition 1: `Webpack` là một `module loader` cho javascript
- Definition 2: `module loader` là một công cụ để quản lí `import` của các thư viện js, merge chúng tại với nhau
để tạo ra một hoặc một vài file bundle
    * Tại sao lại cần dùng module loader: Hiện tại thế giới front-end không giống như là HTML, CSS, JQuery là 
    cân được thế giới như ngày xưa nữa. Khi thực hiện một dự án React, Vue hay Angular chúng ta phải sử dụng 
    rất nhiều các thư viện khác mà cứ để vào thẻ `<script/>` như trước chắc chắn là ko ổn cũng như hiệu năng  
    bị hạn chế => Module loader ra đời

- Definition 3: `Loader` nà gì?. Là những thư viện mà webpack cho phép can thiệp trước khi `import` files.
Cho phép không chỉ bundle js files mà cả nhưng static như css, image ... (Vậy nghĩa là muốn bundle cái gì
thì làm ơn install loader cái đấy vào nhá) 
VD một số Loader: `style-loader`, `babel-loader` max phổ biến `file-loader`...

- babel-loader: làm nhiệm vụ transpile ES6 -> ES5 vậy muốn bundle js thì cho web hiểu thì cần babel-loader 
chạy trước webpack (giờ còn ai không viết es6 nữa giơ tay nào để bỏ bố cái thằng này đi)

- style-loader: Như đã nói ở phần định nghĩa loader, style loader là một thư viện nhằm nâng cao khả năng của 
webpack không chỉ bundle js mà còn bundle cả style (đơn giản là nhét vào thẻ s)

- file-loader: tượng tự như style-loader, nhưng là để bundle static file

- Sass/scss-loader: Lại là một thư viện dể tiền sử lí trước style-loader
    * sass-loader transforms Sass thành CSS.
    * css-loader parses CSS vào JavaScript và resolve dependencies.
    * style-loader chèn CSS vào bên trong thẻ `style`
