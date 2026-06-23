---
title: "Documentation | NestJS - A progressive Node.js framework"
source_url: "https://docs.nestjs.com/openapi/types-and-parameters"
crawled_at: "2026-06-23T15:23:51.366Z"
---

### Types and parameters

The `SwaggerModule` searches for all `@Body()`, `@Query()`, and `@Param()` decorators in route handlers to generate the API document. It also creates corresponding model definitions by taking advantage of reflection. Consider the following code:

```

@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> **Hint** To explicitly set the body definition use the `@ApiBody()` decorator (imported from the `@nestjs/swagger` package).

Based on the `CreateCatDto`, the following model definition Swagger UI will be created:

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782228230/aha-mind/docs-crawler/docs.nestjs.com/swagger-dto_y30u3v.png)

As you can see, the definition is empty although the class has a few declared properties. In order to make the class properties visible to the `SwaggerModule`, we have to either annotate them with the `@ApiProperty()` decorator or use the CLI plugin (read more in the **Plugin** section) which will do it automatically:

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

> **Hint** Instead of manually annotating each property, consider using the Swagger plugin (see [Plugin](https://docs.nestjs.com/openapi/cli-plugin) section) which will automatically provide this for you.

Let's open the browser and verify the generated `CreateCatDto` model:

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782228230/aha-mind/docs-crawler/docs.nestjs.com/swagger-dto2_jlvlm6.png)

In addition, the `@ApiProperty()` decorator allows setting various [Schema Object](https://swagger.io/specification/#schemaObject) properties:

```

@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

> **Hint** Instead of explicitly typing the `@ApiProperty({ required: false })` you can use the `@ApiPropertyOptional()` short-hand decorator.

In order to explicitly set the type of the property, use the `type` key:

```

@ApiProperty({
  type: Number,
})
age: number;
```

#### Arrays[#](https://docs.nestjs.com/openapi/types-and-parameters#arrays)

When the property is an array, we must manually indicate the array type as shown below:

```

@ApiProperty({ type: [String] })
names: string[];
```

> **Hint** Consider using the Swagger plugin (see [Plugin](https://docs.nestjs.com/openapi/cli-plugin) section) which will automatically detect arrays.

Either include the type as the first element of an array (as shown above) or set the `isArray` property to `true`.

#### Circular dependencies[#](https://docs.nestjs.com/openapi/types-and-parameters#circular-dependencies)

When you have circular dependencies between classes, use a lazy function to provide the `SwaggerModule` with type information:

```

@ApiProperty({ type: () => Node })
node: Node;
```

> **Hint** Consider using the Swagger plugin (see [Plugin](https://docs.nestjs.com/openapi/cli-plugin) section) which will automatically detect circular dependencies.

#### Generics and interfaces[#](https://docs.nestjs.com/openapi/types-and-parameters#generics-and-interfaces)

Since TypeScript does not store metadata about generics or interfaces, when you use them in your DTOs, `SwaggerModule` may not be able to properly generate model definitions at runtime. For instance, the following code won't be correctly inspected by the Swagger module:

```

createBulk(@Body() usersDto: CreateUserDto[])
```

In order to overcome this limitation, you can set the type explicitly:

```

@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

#### Enums[#](https://docs.nestjs.com/openapi/types-and-parameters#enums)

To identify an `enum`, we must manually set the `enum` property on the `@ApiProperty` with an array of values.

```

@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

Alternatively, define an actual TypeScript enum as follows:

```

export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

You can then use the enum directly with the `@Query()` parameter decorator in combination with the `@ApiQuery()` decorator.

```

@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782228230/aha-mind/docs-crawler/docs.nestjs.com/enum_query_hd3uow.gif)

With `isArray` set to **true**, the `enum` can be selected as a **multi-select**:

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782228230/aha-mind/docs-crawler/docs.nestjs.com/enum_query_array_btkfn0.gif)

#### Enums schema[#](https://docs.nestjs.com/openapi/types-and-parameters#enums-schema)

By default, the `enum` property will add a raw definition of [Enum](https://swagger.io/docs/specification/data-models/enums/) on the `parameter`.

```

- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```

The above specification works fine for most cases. However, if you are utilizing a tool that takes the specification as **input** and generates **client-side** code, you might run into a problem with the generated code containing duplicated `enums`. Consider the following code snippet:

```

// generated client-side code
export class CatDetail {
  breed: CatDetailEnum;
}

export class CatInformation {
  breed: CatInformationEnum;
}

export enum CatDetailEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}

export enum CatInformationEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
```

> **Hint** The above snippet is generated using a tool called [NSwag](https://github.com/RicoSuter/NSwag).

You can see that now you have two `enums` that are exactly the same. To address this issue, you can pass an `enumName` along with the `enum` property in your decorator.

```

export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

The `enumName` property enables `@nestjs/swagger` to turn `CatBreed` into its own `schema` which in turns makes `CatBreed` enum reusable. The specification will look like the following:

```

CatDetail:
  type: 'object'
  properties:
    ...
    - breed:
        schema:
          $ref: '#/components/schemas/CatBreed'
CatBreed:
  type: string
  enum:
    - Persian
    - Tabby
    - Siamese
```

> **Hint** Any **decorator** that takes `enum` as a property will also take `enumName`.

#### Property value examples[#](https://docs.nestjs.com/openapi/types-and-parameters#property-value-examples)

You can set a single example for a property by using the `example` key, like this:

```

@ApiProperty({
  example: 'persian',
})
breed: string;
```

If you want to provide multiple examples, you can use the `examples` key by passing in an object structured like this:

```

@ApiProperty({
  examples: {
    Persian: { value: 'persian' },
    Tabby: { value: 'tabby' },
    Siamese: { value: 'siamese' },
    'Scottish Fold': { value: 'scottish_fold' },
  },
})
breed: string;
```

#### Raw definitions[#](https://docs.nestjs.com/openapi/types-and-parameters#raw-definitions)

In certain cases, such as deeply nested arrays or matrices, you may need to manually define your type:

```

@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
})
coords: number[][];
```

You can also specify raw object schemas, like this:

```

@ApiProperty({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Error'
    },
    status: {
      type: 'number',
      example: 400
    }
  },
  required: ['name', 'status']
})
rawDefinition: Record<string, any>;
```

To manually define input/output content in controller classes, use the `schema` property:

```

@ApiBody({
  schema: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
})
async create(@Body() coords: number[][]) {}
```

To define additional models that are not directly referenced in your controllers but should be inspected by the Swagger module, use the `@ApiExtraModels()` decorator:

```

@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

> **Hint** You only need to use `@ApiExtraModels()` once for a specific model class.

Alternatively, you can pass an options object with the `extraModels` property specified to the `SwaggerModule.createDocument()` method, as follows:

```

const documentFactory = () =>
  SwaggerModule.createDocument(app, options, {
    extraModels: [ExtraModel],
  });
```

To get a reference (`$ref`) to your model, use the `getSchemaPath(ExtraModel)` function:

```

'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

#### oneOf, anyOf, allOf[#](https://docs.nestjs.com/openapi/types-and-parameters#oneof-anyof-allof)

To combine schemas, you can use the `oneOf`, `anyOf` or `allOf` keywords ([read more](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/)).

```

@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```

If you want to define a polymorphic array (i.e., an array whose members span multiple schemas), you should use a raw definition (see above) to define your type by hand.

```

type Pet = Cat | Dog;

@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

> **Hint** The `getSchemaPath()` function is imported from `@nestjs/swagger`.

Both `Cat` and `Dog` must be defined as extra models using the `@ApiExtraModels()` decorator (at the class-level).

#### Schema name and description[#](https://docs.nestjs.com/openapi/types-and-parameters#schema-name-and-description)

As you may have noticed, the name of the generated schema is based on the name of the original model class (for example, the `CreateCatDto` model generates a `CreateCatDto` schema). If you'd like to change the schema name, you can use the `@ApiSchema()` decorator.

Here’s an example:

```

@ApiSchema({ name: 'CreateCatRequest' })
class CreateCatDto {}
```

The model above will be translated into the `CreateCatRequest` schema.

By default, no description is added to the generated schema. You can add one using the `description` attribute:

```

@ApiSchema({ description: 'Description of the CreateCatDto schema' })
class CreateCatDto {}
```

That way, the description will be included in the schema, as follows:

```

schemas:
  CreateCatDto:
    type: object
    description: Description of the CreateCatDto schema
```
