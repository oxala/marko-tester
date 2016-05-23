#marko-tester

===

Test library to assist with testing UI components generated using Marko Template Engine.

## Usage

### Start using marko-tester with:

```
npm install --save-dev marko-tester
```

See `/test/mock-component` for an example using this test library.

### Build marko-tester with:

```
npm install
```

### Test marko-tester with:

```
grunt test
```

## Render testing

The rendering test works by giving the Marko template the input to use for rendering, and by comparing the generated HTML with the expected HTML.

The test works with the following naming conventions required for the input JSON file and the expected HTML file that define a test case:

```
{test-case}.json
{test-case}.html
```

## Client testing

The client test works by instanstiating a marko-widget inside phantomJS browser and testing the functionality against it.

You need to create a file in which you need to pass your paths to client-tests, see example in:

```
/test/client.js
```

You could also use client-helpers to set up widget environment and inject widget into the `window`, see example in:

```
/test/mock-component-combined/test/client/client-test.js
```
