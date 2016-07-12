#marko-tester

===

Test library to assist with testing marko-widget UI components.

## Usage

#### Start using marko-tester with:

```
npm install --save-dev marko-tester
```

See `/test` for an example using this test library.

There are two things you can test:

### Template rendering given specific input;

The rendering test works by giving the Marko template the input to use for rendering, and by comparing the generated HTML with the expected HTML.


The test works with the following naming conventions required for the input JSON file and the expected HTML file that define a test case:

```
{test-case}.json
{test-case}.html
{another-test-case}.js
{another-test-case}.html
```

### Rendered template client testing;

The client test works by instanstiating a marko-widget and testing the functionality against it.

You need to create a file in which you can pass settings for client-testing, see example in:

```
/test/index.spec.js
```

This file should be targeted first by mochacli.

## Contribution

#### Build marko-tester with:

```
npm install
```

#### Test marko-tester with:

```
grunt test
```
