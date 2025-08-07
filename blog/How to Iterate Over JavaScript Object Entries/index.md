---
title: 5 ways to iterate over javascript object
date: "2019-04-04"
category: "Javascript"
tags:
  - "Javascript"
  - "Iterate object"
  - "Es6"
description: "5 ways to iterate over javascript object and compare the performance each other"
---

## Technique 1 : Object.entries
```javascript
let obj = {
  key1: "value1",
  key2: "value2",
  key3: "value3"
}

Object.entries(obj)
//0: (2) ["key1", "value1"]
//1: (2) ["key2", "value2"]
//2: (2) ["key3", "value3"]

Object.entries(obj).forEach(entry => {
  let key = entry[0];
  let value = entry[1];
  //use key and value here
});
```

## Technique 2 : Object.keys
```javascript
let obj = {
  key1: "value1",
  key2: "value2",
  key3: "value3"
}

Object.keys(obj) // return array of object key

Object.keys(obj).forEach(key => {
  let value = obj[key];
  //use key and value here
});

```

## Technique 3 : Object.values
```javascript
let obj = {
  key1: "value1",
  key2: "value2",
  key3: "value3"
}

Object.values(obj) // return array of object value

Object.values(obj).forEach(value => {
  //use value here
});
```

## Technique 4 : for...in loop
```javascript
let obj = {
  key1: "value1",
  key2: "value2",
  key3: "value3"
}

for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    //no a property from prototype chain     
  }else{
    //property from protytpe chain
  }
}
```

## Technique 5 : Object.getOwnPropertyNames
- Like the for ... in technique but dont need to use hasOwnProperty build in method
```javascript
let obj = {
  key1: "value1",
  key2: "value2",
  key3: "value3"
}

Object.getOwnPropertyNames(obj).forEach(key => {
  let value = obj[key];
  //use key and value here
});
```
