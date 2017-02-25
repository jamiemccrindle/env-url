# env-url
A simple node program for executing commands using environment variables supplied by a url

## Install
`npm install env-url` or `npm install -g env-url`

## Usage

**Package.json**
```json
{
  "scripts": {
    "start": "env-url http://localhost:8000/config/development node ./index.js"
  }
}
```
## Environment File Format

env-url expects to pull JSON down from a URL using a POST. It will turn json into environment variables, including
nested json e.g.:

    {
      "test": "value",
      "nestedTest": {
        "test": 1
      }
    }

becomes:

    TEST=value
    NESTED_TEST_TEST=1

## Why

Because it can be useful to get configuration from an HTTP endpoint
