# Inher

Provides `.extend()` convenience function with argument stubbing, always retaining the prototypal inheritance chain making `instanceof` work.

[![Build Status](https://travis-ci.org/thanpolas/inher.png?branch=master)](https://travis-ci.org/thanpolas/inher)

## Installation

```shell
npm install inher --save
```


## Quick Start

```javascript
var inher = require('inher');

// Create a child from the base Constructor.
var Child = inher.extend();

Child.prototype.add = function(a, b) {
  return a + b;
};

// Create a grand child from the child using a Constructor.
var GrandChild = Child.extend(function(a, b){
  this.a = a;
  this.b = b;
});

GrandChild.prototype.getAddition = function() {
  return this.add(this.a, this.b);
};

// instantiate a GrandChild
var grandChild = new GrandChild(4, 5);

console.log(grandChild.getAddition());
// prints: 9
```

## Documentation

### extend() Creates new children

> inher.extend(...args=, Constructor=)

* **...args=** `Any Type` *Optional* :: Any number of any type of arguments to use for stubbing the Parent Constructor. This is an advanced topic, more on that at [Stubbed Arguments](#argument-stubbing-with-extend).
* **Constructor=** `Function` *Optional* :: Optionally pass a Constructor.
* Returns `Function` A new Constructor.

Extend will create a new Constructor that inherits from the Ctor it was called from. Optionally you can define your own Constructor that will get invoked as expected on every new instantiation.

Extend uses the [Pseudo Classical][proto.post] [pattern][addy.proto], the same exact mechanism that is used by [`util.inherits`][util.inherits].

[Check out the tests relating to `extend()` and inheritance.][test.inheritance]

### Custom Constructor and Arguments

Using your own constructor when invoking `extend()` is a good practise for properly initializing your instances. Your constructor may accept any number of arguments as passed on instantiation. All Parent constructors will receive the same exact arguments, unless you use Argument Stubbing...

### Argument Stubbing with extend()

Argument Stubbing is providing arguments to the `extend()` function with the intend of passing them to the Parent constructor. Consider this case:

##### base.model.js

```js
var Model = inher.extend(function(name) {
  this._modelName = name;
});

Model.prototype.getName = function() {
  return this._modelName;
};
```

##### user.model.js

```js
var Model = require('./base.model');

// "user" is a stubbed argument, it will be passed to the
// Model Constructor as the first argument.
var UserModel = Model.extend('user', function(firstName, lastName){
  this.firstName = firstName;
  this.lastName = lastName;
});

var user = new UserModel('John', 'Doe');
console.log(user.getName());
// prints "user"
```
Argument Stubbing can be infinitely nested and inherited, Inher keeps track of each Constructor's Stubbed Arguments and applies them no matter how long the inheritance chain is.

> **Beware** While Inher does a good job at not confusing passed functions as your Constructor, the last argument of the `extend()` method if it's of type `function` is will always be used as the new constructor.

```js
// can stub arguments without a constructor
var GrandChild = Child.extend(1, 2, 3);

// If last argument is a function it will be the Constructor
var GreatGrandChild = GrandChild.extend(4, 5, 6, function(){/* ctor */});
```

[Check out the tests relating to argument stubbing.][test.stubbed]

#### Constructor Arity is important

Inher uses your constructor's arity to determine the exact amount of arguments to pass. This means that the constructor will get as many arguments as are defined, as long as they are available by the instantiation.

[proto.post]: http://dsheiko.com/weblog/prototypal-inheritance-in-javascript-for-modules/
[addy.proto]: http://addyosmani.com/resources/essentialjsdesignpatterns/book/#constructorpatternjavascript
[util.inherits]: http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor
[test.stubbed]: https://github.com/thanpolas/inher/blob/master/test/arguments.test.js

#### Static Methods and Properties

Static methods and properties are the ones that are defined on the Constructor directly vs using the `prototype`. Static functions and properties do not get inherited by subsequent children. A good use for static properties is to define consts or enums that relate to your module.

```js
var UserModel = Model.extend(function(userType) {
  /** @type {UserModel.Type} Store the user type in the instance */
  this._userType = userType;
});

/** @enum {string} The types of users */
UserModel.Type = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

// ...

var moderator = new UserModel(UserModel.Type.MODERATOR);
```

#### Instantiation

The inheritance pattern Inher uses dictates that all instances are created using the `new` keyword.

```js

var Thing = inher.extend();

var thing = new Thing();
```

Inher itself is a constructor that can be instantiated and has a `prototype` that you can mingle with, but we don't want to go there now, do we? Be responsible.



[test.inheritance]: https://github.com/thanpolas/inher/blob/master/test/inher-itance.test.js

### mixin() Mixin the prototype of a Constructor

> Ctor.mixin(Constructor, [Ctor, Ctor])

* **Constructor** `...Function|Array.<Function>` :: Any number of Constructors passed as separate arguments or in an Array.

The `mixin()` method will merge the prototype of the mixed in Ctors and ensure their constructors are invoked. The full inheritance chain of a Mixin is honored along with their respective Stubbed Arguments, if any. The Mixin's constructor will be invoked in the same context and therefore you can easily interact with internal properties and methods.

```js
var Human = inher.extend(function() {
  this.firstName = null;
  this.lastName = null;
});

var Woman = inher.extend(function() {
  this.favoriteColor = null;
});

var Man = inher.extend(function() {
  this.favoriteChannel = null;
});

var Developer = inher.extend(function() {
  this.programmingLanguages = [];
  this.email = null;
});

var Designer = inher.extend(function() {
  this.colors = [];
  this.email = null;
});
// ...

var Unicorn = Human.extend();
Unicorn.mixin(Woman, Man, Developer, Designer);

// now that isn't quite a Unicorn, but you get the picture...
Array.isArray(Unicorn.colors); // true
Array.isArray(Unicorn.programmingLanguages); // true
null === Unicorn.favoriteChannel; // true
```

#### Order of Invocation

Mixin constructors will be invoked before the Constructor that mixed them in, so for the following case:

```js
var Core = inher.mixin();

var MixinOne = Core.extend();
var MixinTwo = inher.extend();
var MixinThree = inher.extend();
var MixinFour = inher.extend();


var Child = inher.extend();
Child.mixin(MixinOne);

var GrandChild = Child.extend();
GrandChild.mixin(MixinTwo, MixinThree);

var GreatGrandChild = GrandChild.extend();
GreatGrandChild.mixin(MixinFour);
```

When `GreatGrandChild` will be instantiated this will be the sequence of Constructor invocations:

1. Core()
2. MixinOne()
3. Child()
4. MixinTwo()
5. MixinThree()
6. GrandChild()
7. MixinFour()
8. GreatGrandChild()

[Check out the Mixins tests](https://github.com/thanpolas/inher/blob/master/test/mixins.test.js)

### getInstance() Get a singleton instance

> Ctor.getInstance(...args)

* **...args** `*` :: Any number of any type of arguments, will be passed to constructors.

Use the `getInstance()` for getting a singleton of the Constructor. Note that arguments can only be passed on the first invocation of `getInstance` which is the one that actually creates a new instance of the Constructor. So be proactive if your singletons require instantiation arguments and invoke early.

```js
var UserController = Controller.extend(function(app) {
  this.app = app;
});

// create the singleton to pass app
UserController.getInstance(require('some-fancy-DI');

// ... someplace else far far away ...

// This will return the same exact instance
var UserController = require('../../controllers/user.ctrl');
var userController = UserController.getInstance();
```


### wrap() Augment a Constructor with Inher helpers

> inher.wrap(VanillaCtor)

* **VanillaCtor** `Function` :: A vanilla constructor.

The `wrap()` method is only available from the Inher module, it will add all the static methods that every Inher ctor has. `wrap()` is used by Inher itself to create the new ancestors.

```js
// Use EventEmitter as the base Constructor.
var EventEmitter = require('events').EventEmitter;

var inher = require('inher');

inher.wrap(EventEmitter);

var Thing = EventEmitter.extend();

var newThing = new Thing();

newThing instanceof EventEmitter; // true
```

[Check out the `wrap()` tests](https://github.com/thanpolas/inher/blob/master/test/wrap.test.js)

### isInher() Determines if a Constructor has Inher properties

> inher.isInher(Ctor)

* **Ctor** `Function` :: A constructor.
* Returns `boolean`

The `isInher()` method is only available from the Inher module, it determines if a constructor has Inher properties.

```js
var inher = require('inher');

var Thing = inher.extend();

inher.isInher(Thing); // true
```

## Release History
- **v0.0.1**, *7 Feb 2014*
    - Big Bang

## License
Copyright (c) 2014 Thanasis Polychronakis. Licensed under the MIT license.
