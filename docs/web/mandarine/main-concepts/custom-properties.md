# Custom Properties
As well as the [`.env`](/docs/mandarine/dot-env-file), `Mandarine.json` allows you to establish custom properties inside it. These properties can then be accessed by using the `@Value` decorator.

----

In order to set your own properties, you must create a JSON file. This JSON file needs to have & respect the structure above, this means, you can add and override values, but you cannot change the structure.
Your configuration file does not have to necessarily follow Mandarine's core configuration such as the server or the template engine information. If you decide to ignore some of these properties, Mandarine will set its default values to those that have been ignored previously.

In order to use your configuration file, you may:

- Create a file in "_./src/main/resources_" called "**properties.json**" 
- Create your own file in a directory of your preference and override the default's location (the one mentioned above) by using a [`Mandarine.json` File](docs/mandarine/mandarine-json-file).

After having your Mandarine's configuration file set up, you can add your own custom properties.

```typescript
{
    "mandarine": {
        "server": {
            "port": 8000
        },
        "myToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    },
    "myCustomPropertyKey": "My custom value"
}
```

> See a list of all possible properties to configure [by clicking here](https://www.mandarinets.org/docs/master/mandarine/properties)