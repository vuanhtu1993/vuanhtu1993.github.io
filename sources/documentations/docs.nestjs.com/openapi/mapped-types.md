---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/openapi/mapped-types"
crawled_at: "2026-06-23T15:24:00.351Z"
---

### Mapped types

As you build out features like **CRUD** (Create/Read/Update/Delete) it's often useful to construct variants on a base entity type. Nest provides several utility functions that perform type transformations to make this task more convenient.

#### Partial[#](https://docs.nestjs.com/openapi/mapped-types#partial)

When building input validation types (also called DTOs), it's often useful to build **create** and **update** variations on the same type. For example, the **create** variant may require all fields, while the **update** variant may make all fields optional.

Nest provides the `PartialType()` utility function to make this task easier and minimize boilerplate.

The `PartialType()` function returns a type (class) with all the properties of the input type set to optional. For example, suppose we have a **create** type as follows:

```

import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

By default, all of these fields are required. To create a type with the same fields, but with each one optional, use `PartialType()` passing the class reference (`CreateCatDto`) as an argument:

```

export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

> **Hint** The `PartialType()` function is imported from the `@nestjs/swagger` package.

#### Pick[#](https://docs.nestjs.com/openapi/mapped-types#pick)

The `PickType()` function constructs a new type (class) by picking a set of properties from an input type. For example, suppose we start with a type like:

```

import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

We can pick a set of properties from this class using the `PickType()` utility function:

```

export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

> **Hint** The `PickType()` function is imported from the `@nestjs/swagger` package.

#### Omit[#](https://docs.nestjs.com/openapi/mapped-types#omit)

The `OmitType()` function constructs a type by picking all properties from an input type and then removing a particular set of keys. For example, suppose we start with a type like:

```

import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

We can generate a derived type that has every property **except**`name` as shown below. In this construct, the second argument to `OmitType` is an array of property names.

```

export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

> **Hint** The `OmitType()` function is imported from the `@nestjs/swagger` package.

#### Intersection[#](https://docs.nestjs.com/openapi/mapped-types#intersection)

The `IntersectionType()` function combines two types into one new type (class). For example, suppose we start with two types like:

```

import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```

We can generate a new type that combines all properties in both types.

```

export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

> **Hint** The `IntersectionType()` function is imported from the `@nestjs/swagger` package.

#### Composition[#](https://docs.nestjs.com/openapi/mapped-types#composition)

The type mapping utility functions are composable. For example, the following will produce a type (class) that has all of the properties of the `CreateCatDto` type except for `name`, and those properties will be set to optional:

```

export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```
