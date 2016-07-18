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

## Coverage

Having tests is awesome, but we should know how much we tested already and how much of code still left to cover. That's why i've implemented Istanbul coverage tool to gather that data for you. Long story short, after a little bit of setup istanbul will gather test coverage from server-side fixture rendering, combine it with client-side marko-widget code coverage and report it in the way you need.

### Configuration:

In the initial marko-tester configuration file mentioned earlier you need to add `coverage` attribute:

```
tester.configure({
    ...
    coverage: {
        // Type of reporters you want your coverage be printed out.
        reporters: [
            'text-summary',
            'html'
        ],
        // Base of your project, in which the JS files should be tested.
        base: 'src',
        // Exclude file patterns and should not be covered.
        excludes: [
            '**/*.marko.js',
            '**/test/**'
        ]
    }
});
```

### Usage:

Imagine you have this command (possible in package.json) to run the unit-tests:

``` 
"scripts": {
    "unit-test": "./node_modules/marko-tester/node_modules/.bin/mocha test/unit/index.spec.js src/components/**/test/*.spec.js --ui bdd --reporter spec"
}
```

You can see the coverage by simply passing `--coverage` argument to that script:

```
npm run unit-test -- --coverage
// ./node_modules/marko-tester/node_modules/.bin/mocha test/unit/index.spec.js src/components/**/test/*.spec.js --ui bdd --reporter spec --coverage
```

## Contribution

#### Build marko-tester with:

```
npm install
```

#### Test marko-tester with:

```
grunt test
```
