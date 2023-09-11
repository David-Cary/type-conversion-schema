# Type Conversion Schema
This library provides a schema for describing javascript data type conversions in a way that can be readily converted to a JSON schema.  It also provides classes for performing said conversions and support for adding new conversion operations to suit your needs.

# Quickstart
## Installation
You can install this library though npm like so:
```
$ npm install --save type-conversion-schema
```

## Usage
Describing a javascript value can be done in much same way you would in a [JSON Schema](https://json-schema.org/understanding-json-schema/).  In fact, behind the scenes the library uses a "JSTypeSchema" that mirrors and can be converted to JSON schema, like so:
```
import {
  JSTypeToJSONSchema,
  JSTypeSchema
} from "type-conversion-schema"

const source: JSTypeSchema = {
  anyOf: [
    {
      type: 'boolean'
    },
    {
      type: 'string'
    }
  ]
}
const results = JSTypeToJSONSchema(source)
```

Note that any such conversion will convert big integers but won't convert things that don't have JSON counterparts, such as functions, symbols, and undefined values.  There's also an 'any' type that gets converted to 'true'.

The TypeConversionSchema interface expands on that by letting you add 'prepare', 'convertVia', and 'finalize' properties to a JSTypeSchema.  Each of these lets you add special action requests to the conversion process.  These request can take the form of string with the target action's name or an object where said action name is in the requests type property.

For example, if you wanted to specify a number should be rounded, you would do so like this:
```
{
  type: 'number',
  finalize: ['round']
}
```

If using the object form of such requests any additional properties will be treated as optional values for that action.  For example, if you wanted to take a slice of the source string it would look like this:
```
{
  type: 'string',
  finalize: [
    {
      type: 'slice',
      start: 1,
      end: 4
    }
  ]
}
```

For reference, 'prepare' actions are applied before the target type is enforced while 'finalize' actions are performed afterwards.  Note that unlike those two you can only have 1 'convertVia' action request instead of an array as it signals an alternate way of performing said type enforcement.

It's also worth noting that some standard JSON schema properties may modify or override some actions.  For example, using a 'const' property makes most actions relatively pointless as the results will get overwritten by that value.

### Literal Conversions
Any data types that have only 1 possible value use the ToLiteralConvertor.  This class ignores action requests as they'd have no effect on the final value.  This is currently limited to null and undefined values.

### Default Preparations
Since prepare actions are performed on untyped data they can be applied to any type conversion.  We provide the following such operations by default.

#### Nested Conversion Action
If you use a 'convert' action in the prepare list that action will look for a type conversion schema in the action's 'to' property and apply that the value before going forward.  This can be useful if you want to force that data to a certain type before converting it further, such as converting to boolean before string conversion if you want just 'true' or 'false' strings and no 'null' strings.

#### Get Value Action
Using a 'get' action will try switching the target value to a nested property of the source value.  The path for that property will taken from the actions 'path' property, like this:
```
{
  type: 'string',
  prepare: [
    {
      type: 'get',
      path: ['user', 'name']
    }
  ]
}
```

Note that this can result in an undefined value if the property doesn't exist.  As such, it's often paired with adding a 'default' value to the schema, like this:

```
{
  type: 'string',
  prepare: [
    {
      type: 'get',
      path: ['user', 'name']
    }
  ],
  default: 'n/a'
}
```

### Any Value Conversions
As mentioned above, if you don't care about the type, you can set the type to 'any'.  Such conversions still enforce standard JSON schema properties like default and const and allow all default preparation action, but have no special finalization action and don't try to change the value's type.

### Array Conversions
By default the ToArrayConvertor will wrap any non-array value in an array.  Alternately, you can use the 'parse' convertVia action if you expect a JSON string a want it to try parsing that first.  The following finalization actions are also supported:

 - 'clone' creates a shallow copy of the array.  You can add "to" and "from" values to this action to set the start and end points of this copy.  This does support getting a position from the end through negative "to" values.  Note that unlike a standard slice this is an inclusive range, so the value at the "to" index will be included in the copy.
 - 'delete' performs a nested deletion, using the action's path property.
 - 'deleteItem' takes one or more adjacent items from the array.  This start at the end of the array unless the action's "index" property specifies otherwise and deletes a single value unless the action's "count" property says otherwise.
 - 'insert' acts as the reverse of deleteItem, adding one or more items to the array.  By default it adds a single undefined value to the end of the array.  You can use the "index" property to change the insertion point, the "value" property to change the value added, and the "repeat" property to set how many copies of that value you want added.
 - 'set' lets you replace an array item or set the nested property of such an item, using the actions path property.  Note that this will try creating objects and arrays as needed to set that value.  In addition to setting the value explicitly through the "value" property, you can use the "from" property is you want to copy the value from a different part of the array to the target position.  Said property is treated a key/index path, just like the path property.  You can also provide a "default" property if you want special handling when the retrieved value is undefined.

### BigInt Conversions
Conversion to BigInt values will try to use the function of the same name ("BigInt(value)") for numbers, strings, and boolean values.  Any other value that needs to be converted will default to 0.

The following finalization actions are available for such values:
 - 'positive' uses the absolute value of the provided value, flipping any negative value to a positive.
 - 'negative' is the inverse of the positive action, flipping any positive value to it's negative counterpart.

### Boolean Conversions
By default boolean conversions simply use the javascript "Boolean" function call (ex. "Boolean(value)").  If you use the convertVia parse action it will check against a list of false values first.  This list defaults to just the "false" string, but you can specify a different list through the action's "false" property, like so:
```
{
  type: 'boolean',
  convertVia: {
    type: 'parse',
    false: ['no']
  }
}
```

The convertor also supports the 'negate' finalization action, letting you flip the value from true to false and vice versa.

### Function Conversions
Conversion to a function is difficult without injecting some kind of scripting.  By default we simply convert any non-function to an anonymous function that return the provided value.

For slightly more complex conversions, you can use the 'wrap' convertVia action.  That lets you specify a conversion schema as the action's "returns" property.  The resulting anonymous function will try use that schema to convert the provided value before returning it.  Note that this will only work if a conversion schema resolver has been provided.

There are currently no special finalization actions for function conversions.

### Number Conversions
Number conversions are handled by the function of the same name ("Number(value)").  They have no special convertVia actions but do have their own version of the 'positive' and 'negative' actions BigInts get.

In addition they have 'round', 'roundUp', and 'roundDown' finalization actions that correspond to the Math object's round, ceiling, and floor functions.  Not that all these rounding actions will try to set the schema's "integer" property to true when applied to the object's schema.

### Object Conversions
Default object creation is a bit limited as the system doesn't know what property to assign non-object values to.  It will try to parse JSON strings and convert arrrays to a map by the string version of that array's keys, but any other value results in an empty object.

To get around this, you can use the 'wrap' convertVia action.  If you do so, you'll get a new object with the value assigned to the property named by the action's "key" property (defaulting to "value").  If the action's "asNeeded" property is set to true, no such wrapping will be done if the value is already a valid object.

Objects their own version of the 'delete' and 'set' finalization actions used by array.  In addition they support the following finalization actions:
 - 'omit' creates a copy that excludes any properties listed in the action's "properties" property.  Note that this results in a normal shallow copy if that property is missing or empty.
 - 'pick' creates a copy that only includes properties listed in the action's "properties" property.  Note that this results in am empty object if that property is missing or empty.

### String Conversions
By default string conversions just use the function of the same name ("String(value)").  The following convertVia actions are available if you want to create string another way:
 - 'date' converts the value to a Date, then uses said date's 'toLocaleDateString' function.  If the action has a 'locales' property, that property gets passed into the function with the acion itself passed as the function's options.
 - 'dateTime' works as the 'date' action but uses the 'toLocaleString' function.
 - 'join' will attempt an array join on the target value, using the action's "with" property as the separator.  This defaults to using an empty string as the separator.
 - 'stringify' will try to use JSON stringify on the provided value, falling back on standard string conversion if that fails.
 - 'time' works as the 'date' action but uses the 'toLocaleTimeString' function.

There are also the following finalization actions available for strings:
 - 'insert' will try to inject the action's "text" value into the string at an index determined by it's "position" property.  If no position is specify the text will be appended to the end of the string.
 - 'lowerCase' uses the string's toLowerCase fuction or toLocaleString if the "locale" property evaluates as true.
 - 'pad' uses the string's "padStart" if the action's "atStart" is true or "padEnd" if not.  The target size for this padding is set by the action's "length" property and the characters to use are set by it's "text" property.
 - 'replace' uses the string's replace function or "replaceAll" if the action's "all" property evaluates as true.  The characters to be replaced are determined by the action's "patter" property, while the characters to be swapped in are covered by the "replacement" property.  You can have it treat the pattern as a regular expression by setting the actions "regex" property to evaluate as true.  If you do so you can further specify the expression's flags through the action's "flags" property.
 - 'slice' uses the string's function of the same name, with the start and end points being set by the corresponding action properties.
 - 'upperCase' uses the string's toUpperCase fuction or toLocaleUpperCase if the "locale" property evaluates as true.

### Symbol Conversions
Symbol conversions normally just use the corresponding javascript function (ex. "Symbol(value)").  Note that this only accepts strings, so anything that isn't already a string or symbol will be converted to a string before conversion.

Alternately, you can use the 'forKey' convertVia action.  That will call "Symbol.for(key)" using the action's key or the provided value if no key is specified.  This lets you reuse a symbol instead of creating a new one.

There are currently no special finalization actions for symbols.

### Resolving Conversions
To actually perform a conversion, simply create a TypeConversionResolver and call it's convert function with the intended value and schema.  When creating the resolver, you'll want to provide it a map of all your conversion handlers, keyed by data type.  Fortunately, this libray comes with a "DEFAULT_TYPE_CONVERTORS" constant you can use for just that purpose.  Bringing that all together looks like this:
```
import {
  TypeConversionResolver,
  DEFAULT_TYPE_CONVERTORS
} from "type-conversion-schema"

const resolver = new TypeConversionResolver(DEFAULT_TYPE_CONVERTORS)

const results = resolver.convert(
  1,
  {
    type: 'string'
  }
)
```

### Custom Conversions
If you want to use your own conversion handlers, simply change what you pass in to the resolver.  Non-literal handlers will also have an "actions" property that stores their know typed, untyped, and conversion actions.  By modifying those maps you can add extra finalization, preparation, and convertVia actions accordingly.  Typed entries will be used for 'finalize' requests, untyped entries will be used for 'prepare' requests, and conversion entries will be used for 'convertVia' requests.
