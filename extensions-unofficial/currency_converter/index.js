// Extension for currency conversion
// by @adityagaurkar

(function() {
    const extensionName = "fx_converter";

    const extensionRoot = new Extension({
        name: extensionName,
        version: "1.0.0",
        author: "Aditya Gaurkar",
        endpoints: ["https://api.frankfurter.dev/v1"],
        requiredAPIKeys:["dummy"],
        category: "Utility",
        dataScope: "none"
    });

    // // Registering preferences for default TO currencies
    // const default_to = new Preference({
    //     key:"to_default",
    //     label: "Default currency to convert to",
    //     type: "selectOne",
    //     defaultValue: "INR",
    //     options: ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK"],
    //     helpText: "Select the default currency to convert to"
    // });
    // extensionRoot.register_preference(default_to);

    // // Registering preferences for default FROM currencies
    // const default_from = new Preference({
    //     key:"from_default",
    //     label: "Default currency to convert from",
    //     type: "selectOne",
    //     defaultValue: "USD",
    //     options: ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK"],
    //     helpText: "Select the default currency to convert from"
    // });
    // extensionRoot.register_preference(default_from);

    // var from_default = getExtensionPreference(extensionName, "from_default");
    // var to_default = getExtensionPreference(extensionName, "to_default");

    const fx = new Command({
        name: "fx",
        type: "insert",
        helpText: "Convert currency from one to another",
        parameters: [
            new Parameter({type: "float", name: "amount", helpText: "Amount to convert"}),
            new Parameter({type: "string", name: "from", helpText: "Currency code to convert from (e.g., USD)", default: from_default}),
            new Parameter({type: "string", name: "to", helpText: "Currency code to convert to (e.g., INR)", default: to_default})
        ],
        extension: extensionRoot
    });

    fx.execute = function(payload){

        const [amount, fromCurrency, toCurrency] = this.getParsedParams(payload);
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();

        if (from === to) {
            return new ReturnObject({status: "error", message: `${amount} ${from} is equal to ${amount} ${to}`});
        }

        function convert(amount) {
            try{
                //making the url for api call
                const url = `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`;

                //calling the api
                const reply = callAPI("dummy", url, "GET", "","");
                const data = JSON.parse(reply.data);
                const rate = data.rates[to];

                //making calculation
                return Math.round(amount * rate * 100) / 100;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        }

        const result = convert(amount);

        return new ReturnObject({status: "success", message: "retrieved", payload: `${result} ${to}`});
    }
})();