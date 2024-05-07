/*
 * LightningChartJS example that showcases a real life application used in Fiber Monitoring
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Import xydata
const xydata = require('@arction/xydata')

// Extract required parts from LightningChartJS.
const {
    lightningChart,
    AxisTickStrategies,
    emptyLine,
    emptyFill,
    AreaSeriesTypes,
    ColorRGBA,
    regularColorSteps,
    PalettedFill,
    LUT,
    emptyTick,
    UIElementBuilders,
    UIOrigins,
    Themes,
} = lcjs

const { createProgressiveTraceGenerator } = xydata

const CONFIG = {
    /**
     * Step between optical fibre measurements (Meters).
     */
    opticalFibreDistanceStep: 10,
    /**
     * Start value for optical fibre axis (Meters).
     */
    opticalFibreDistanceStart: 0,
    /**
     * End value for optical fibre axis (Meters).
     */
    opticalFibreDistanceEnd: 3200,
    /**
     * Step between each heat map row along Time Axis (lower chart Y axis) (Milliseconds).
     */
    timeStep: 1000,
    /**
     * Start time along Time Axis (lower chart Y axis) (Milliseconds).
     */
    timeStart: new Date('2021-06-17T08:54:04').getTime(),
    /**
     * End time along Time Axis (lower chart Y axis) (Milliseconds).
     */
    timeEnd: new Date('2021-06-17T08:54:38').getTime(),
}

// All Axis coordinates on Date Axis are offset by this value to prevent zooming issues.
const dateOrigin = CONFIG.timeStart

const dataPromise = new Promise(async (resolve) => {
    const timeStepsCount = Math.ceil((CONFIG.timeEnd - CONFIG.timeStart) / CONFIG.timeStep)
    const opticalFibreLengthX = Math.ceil(
        (CONFIG.opticalFibreDistanceEnd - CONFIG.opticalFibreDistanceStart) / CONFIG.opticalFibreDistanceStep,
    )
    const traceDataArray = await Promise.all(
        new Array(timeStepsCount).fill(0).map((_, i) =>
            createProgressiveTraceGenerator()
                .setNumberOfPoints(opticalFibreLengthX)
                .generate()
                .toPromise()
                .then((xyPoints) => xyPoints.map((xy) => Math.abs(xy.y * 100))),
        ),
    )
    // `traceDataArray` can be supplied into heat map series as is,
    // calculate data for Area Series by summing every trace column value for every X coordinate.
    const areaData = new Array(opticalFibreLengthX).fill(0).map((_, iX) => ({
        x: CONFIG.opticalFibreDistanceStart + iX * CONFIG.opticalFibreDistanceStep,
        y: traceDataArray.reduce((sum, cur) => sum + cur[iX], 0),
    }))

    resolve({
        traceDataArray,
        areaData,
    })
})

const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Distance Intensity Chart')

chart.yAxis.dispose()
const axisTopY = chart.addAxisY({ iStack: 1 }).setTitle('Intensity Sum').setLength({ pixels: 200 }).setMargins(10, 0)
const axisX = chart.axisX.setTitle('Optical Fiber Distance (m)')

const formatterOptionsDateTimeAxis = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}

const axisBottomY = chart
    .addAxisY({ iStack: 0 })
    .setTitle('Time')
    .setTickStrategy(AxisTickStrategies.DateTime, (ticks) =>
        ticks
            .setDateOrigin(new Date(dateOrigin))
            .setGreatTickStyle(emptyTick)
            .setMinorTickStyle(emptyTick)
            .setFormattingDay({}, formatterOptionsDateTimeAxis, {})
            .setFormattingDecade(formatterOptionsDateTimeAxis, {})
            .setFormattingHour({}, formatterOptionsDateTimeAxis, {})
            .setFormattingMilliSecond({}, formatterOptionsDateTimeAxis)
            .setFormattingMinute({}, formatterOptionsDateTimeAxis, {})
            .setFormattingMonth({}, formatterOptionsDateTimeAxis, {})
            .setFormattingSecond({}, formatterOptionsDateTimeAxis)
            .setFormattingWeek({}, formatterOptionsDateTimeAxis, {})
            .setFormattingYear(formatterOptionsDateTimeAxis, {}),
    )

const theme = chart.getTheme()
const lut = new LUT({
    interpolate: false,
    steps: [{ value: 0, color: ColorRGBA(0, 0, 0, 0) }, ...regularColorSteps(200, 600, theme.examples.intensityColorPalette)],
})

// Visualize data.
dataPromise.then((data) => {
    const { traceDataArray, areaData } = data

    const areaSeries = chart
        .addAreaSeries({ type: AreaSeriesTypes.Positive, yAxis: axisTopY })
        .add(areaData)
        .setCursorResultTableFormatter((builder, series, x, y) =>
            builder.addRow('Intensity sum:', '', y.toFixed(1)).addRow('Optical fiber distance:', '', axisX.formatValue(x) + ' m'),
        )

    const heatmapOptions = {
        columns: traceDataArray[0].length,
        rows: traceDataArray.length,
        start: {
            x: CONFIG.opticalFibreDistanceStart,
            y: CONFIG.timeStart - dateOrigin,
        },
        step: {
            x: CONFIG.opticalFibreDistanceStep,
            y: CONFIG.timeStep,
        },
        dataOrder: 'rows',
        yAxis: axisBottomY,
    }
    const heatmapSeries = chart
        .addHeatmapGridSeries(heatmapOptions)
        .setIntensityInterpolation('disabled')
        .invalidateIntensityValues(traceDataArray)
        .setFillStyle(
            new PalettedFill({
                lookUpProperty: 'value',
                lut,
            }),
        )
        .setWireframeStyle(emptyLine)
        .setCursorResultTableFormatter((builder, series, dataPoint) =>
            builder
                .addRow('Intensity:', '', dataPoint.intensity.toFixed(1))
                .addRow('Optical fiber distance:', '', axisX.formatValue(dataPoint.x) + ' m')
                .addRow('Time:', '', axisBottomY.formatValue(dataPoint.y)),
        )

    chart.setPadding({
        bottom: 64,
    })

    const lutRange = chart
        .addUIElement(UIElementBuilders.LUTRange)
        .setLUT(lut)
        .setLUTLength(500)
        .setLookUpUnit('Intensity')
        .setPosition({ x: 50, y: 0 })
        .setOrigin(UIOrigins.CenterBottom)
        .setAutoDispose({
            type: 'max-width',
            maxWidth: 0.8,
        })
        .setBackground((background) => background.setFillStyle(emptyFill).setStrokeStyle(emptyLine))
})
