SEL - Simple Expression Language
====================================

[![Build Status](https://travis-ci.org/Logicify/sel-js.svg?branch=master)](https://travis-ci.org/Logicify/sel-js)

JS implementation of the [SEL(Simple Expression Language)](https://github.com/Logicify/sel)

# Syntax Examples

Simple interpolation

```
Hello, $username.
```

Invoke function

```
Uppercased value of test is $upper(test)
```

Invoke function with variable argument

```
Uppercased username is $upper($username)
```

Logical operations (conjunction)

```
$allOf(true, false, false)
```

More complex logical operations

```
$anyOf($not($myVar), $myVar)
```

# Usage

To be added soon.

Credits
-------
Alexander Beskrovny, Logicify (<http://logicify.com/>)