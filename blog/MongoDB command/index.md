---
title: Some mongoDB command for beginner
date: "2019-03-29"
category: "MongoDB"
authors: [anhhtus]
tags:
  - "NodeJS"
  - "Web API"
  - "Express"
description: "Some useful command to work with mongoDB for beginner, let's get started"
---

### 1. Log Into MongoDB
```
mongo -u <username> -p <password> --authenticationDatabase <dbname>
```
Câu lệnh được sử dụng để xác thực vào db ở local
### 2. Show All Databases
```
show dbs
```
Show tất cả các DB
### 3. Select Database to Work With
```
use <dbname>
```
Chọn DB sử dụng
### 4. Authenticate and Log Out From Database
```
// Authenticate
//
db.auth("username", "password");
//
// Logout
//
db.logout()
```
Khi chuyển sang một DB khác, cẩn phải xác thực để sử dụng DB và logout khỏi 

### 5. List Down Collections, Users, Roles, etc.
```
//
// List down collections of the current database
//
show collections;
db.getCollectionNames();
//
// List down all the users of current database
//
show users;
db.getUsers();
//
// List down all the roles
//
show roles
```
### 6. Create a Collection
```
db.createCollection("collectionName");
```
### 7. Insert a Document in a Collection
```
db.createCollection("collectionName");
```

### 7. Insert a Document in a Collection
```
//
// Insert single document
//
db.<collectionName>.insert({field1: "value", field2: "value"})
//
// Insert multiple documents
//
db.<collectionName>.insert([{field1: "value1"}, {field1: "value2"}])
db.<collectionName>.insertMany([{field1: "value1"}, {field1: "value2"}])
```

### 8. Save or Update Document
```
//
// Matching document will be updated; In case, no document matching the ID is found, a new document is created
//
db.<collectionName>.save({"_id": new ObjectId("jhgsdjhgdsf"), field1: "value", field2: "value"});
```
Câu lệnh này thực hiện hoặc là thêm mới họăc là update trường thông tin phụ thuộc voà giá trị của _id

### 9. Display Collection Records
```
//
// Retrieve all records
//
db.<collectionName>.find();
//
// Retrieve limited number of records; Following command will print 10 results;
//
db.<collectionName>.find().limit(10);
//
// Retrieve records by id
//
db.<collectionName>.find({"_id": ObjectId("someid")});
//
// Retrieve values of specific collection attributes by passing an object having 
// attribute names assigned to 1 or 0 based on whether that attribute value needs 
// to be included in the output or not, respectively.
//
db.<collectionName>.find({"_id": ObjectId("someid")}, {field1: 1, field2: 1});
db.<collectionName>.find({"_id": ObjectId("someid")}, {field1: 0}); // Exclude field1
//
// Collection count
//
db.<collectionName>.count();
```
### 10. Administrative Commands
```
//
// Get the collection statistics 
//
db.<collectionName>.stats()
db.printCollectionStats()
//
// Latency statistics for read, writes operations including average time taken for reads, writes
// and related umber of operations performed
//
db.<collectionName>.latencyStats()
//
// Get collection size for data and indexes
//
db.<collectionName>.dataSize() // Size of the collection
db.<collectionName>.storageSize() // Total size of document stored in the collection
db.<collectionName>.totalSize() // Total size in bytes for both collection data and indexes
db.<collectionName>.totalIndexSize() // Total size of all indexes in the collection
```
