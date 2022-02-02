# JavaScript Distance Intensity Chart

![JavaScript Distance Intensity Chart](dashboardWaterfall.png)

This demo application belongs to the set of examples for LightningChart JS, data visualization library for JavaScript.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.

The demo can be used as an example or a seed project. Local execution requires the following steps:

- Make sure that relevant version of [Node.js](https://nodejs.org/en/download/) is installed
- Open the project folder in a terminal:

        npm install              # fetches dependencies
        npm start                # builds an application and starts the development server

- The application is available at *http://localhost:8080* in your browser, webpack-dev-server provides hot reload functionality.


## Description

This example is based on a real life usage scenario of _LightningChart JS_ in the field of **Fiber Analysis**.

_Fiber Analysis_ refers to the assessment of fiber quality to analyze attenuation and other fiber optic performance metrics during single point of time or across a time period.

This example showcases an example dashboard for analyzing fiber properties over a short time period (~30 seconds).

The metrics are gathered at several locations across the fiber to help spot problem locations (total fibre length is more than 3 kilometers).

The primary metric, _intensity_, is recorded for each location along fibre (meters) and for various time steps. The _intensity_ value is _abstract_, meaning that it could reflect many different values for different analysis purposes. A common property in fiber metrics to analyse is _Attenuation_.

The color of each sample is colored in a _heat map grid series_ based on a color lookup table, which makes identifying _hot spots_ convenient (for example, orange is bad, blue is ok).

The data used in the example is randomly generated each time the example is run.


## API Links

* [LightningChart]
* [Chart XY]
* [Axis XY]
* [Area Series]
* [Heatmap Grid Series]
* [UI LUT range]
* [UI Element]
* [Axis Tick strategies]
* [Area series types]
* [Color factory RGBA]
* [Paletted fill style]
* [Color lookup table]
* [Empty line style]
* [Empty fill style]
* [Empty tick style]
* [UI element builders]
* [UI origins]


## Support

If you notice an error in the example code, please open an issue on [GitHub][0] repository of the entire example.

Official [API documentation][1] can be found on [Arction][2] website.

If the docs and other materials do not solve your problem as well as implementation help is needed, ask on [StackOverflow][3] (tagged lightningchart).

If you think you found a bug in the LightningChart JavaScript library, please contact support@arction.com.

Direct developer email support can be purchased through a [Support Plan][4] or by contacting sales@arction.com.

[0]: https://github.com/Arction/
[1]: https://www.arction.com/lightningchart-js-api-documentation/
[2]: https://www.arction.com
[3]: https://stackoverflow.com/questions/tagged/lightningchart
[4]: https://www.arction.com/support-services/

© Arction Ltd 2009-2020. All rights reserved.


[LightningChart]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/interfaces/lightningchart.html
[Chart XY]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/chartxy.html
[Axis XY]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/axis.html
[Area Series]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/areaseriespositive.html
[Heatmap Grid Series]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/heatmapgridseriesintensityvalues.html
[UI LUT range]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/interfaces/uilutrange.html
[UI Element]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/interfaces/uielement.html
[Axis Tick strategies]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#axistickstrategies
[Area series types]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#areaseriestypes
[Color factory RGBA]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#colorrgba
[Paletted fill style]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/palettedfill.html
[Color lookup table]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/classes/lut.html
[Empty line style]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#emptyline
[Empty fill style]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#emptyfill
[Empty tick style]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#emptytick
[UI element builders]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#uielementbuilders
[UI origins]: https://www.arction.com/lightningchart-js-api-documentation/v3.4.0/globals.html#uiorigins

