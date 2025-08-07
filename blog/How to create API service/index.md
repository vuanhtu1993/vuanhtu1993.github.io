---
title: Tạo API services bằng “fetch” trong React
date: "2019-06-01"
authors: [anhhtus]
category: "React"
tags:
  - "React"
  - "React-DOM"
  - "API service"
description: "How to create API service to manage easily"
---

### How to create API service 

```javascript
const Header = {
  token: LocalStorage.getItem("token"),
};

const PATH_BASE = "";

class DynamicAPI {
  constructor() {
    this.header = Header;
    this.pathBase = PATH_BASE
  }

  request = ({path, method, body}) => {
    return fetch(this.pathBase + path, {
      method: method,
      headers: this.header,
      body: body
    }).then((response) => {
      // if response success => return response
      // else if 401 => logout
      // else if 404 => redirect Not Found
      // else if 409 => throw Error
      // ....
    })
  };

  get = ({path}) => {
    return this.request({path, method: "GET", body: null})
  };

  post = ({path, body}) => {

  }
  /*same for post, delete and put*/
}

export default new DynamicAPI();

const AuthService = {
  login: async (email, password) => {
    const res = await DynamicAPI.post({path: "/login", body: {email, password}})
    // LocalStorage.setItem("token", token)
    // LocalStorage.setItem("user", user)
  },

  logout: () => {

  }
};

const APIService = {
  getListStaff: () => {
    return DynamicAPI.get({path: '/staff'})
  }
};

```
