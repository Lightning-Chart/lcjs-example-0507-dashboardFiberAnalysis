/*
 * LightningChartJS example that showcases a real life application used in Fiber Monitoring
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Import xydata
const xydata = require('@lightningchart/xydata')

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

const axisBottomY = chart
    .addAxisY({ iStack: 0 })
    .setTitle('Time')
    .setTickStrategy(AxisTickStrategies.DateTime, (ticks) => ticks.setDateOrigin(new Date(dateOrigin)).setGreatTickStyle(emptyTick))

const theme = chart.getTheme()
const lut = new LUT({
    interpolate: false,
    steps: [{ value: 0, color: ColorRGBA(0, 0, 0, 0) }, ...regularColorSteps(200, 600, theme.examples.intensityColorPalette)],
})

// Visualize data.
dataPromise.then((data) => {
    const { traceDataArray, areaData } = data

    chart.setCursorFormatting((_, __, hits) => {
        const hitIntensity = hits.find((hit) => hit.series === areaSeries)
        const hitHeatmap = hits.find((hit) => hit.series === heatmapSeries)
        if (!hitIntensity || !hitHeatmap) return
        return [
            [`Optical fiber distance`, '', `${Math.round(hitIntensity.x)} m`],
            [hitIntensity.series, '', hitIntensity.axisY.formatValue(hitIntensity.y)],
            [hitHeatmap.series, ''],
            ['', hitHeatmap.axisY.formatValue(hitHeatmap.y)],
            ['Intensity', '', hitHeatmap.intensity.toFixed(1)],
        ]
    })

    const areaSeries = chart.addAreaSeries({ type: AreaSeriesTypes.Positive, yAxis: axisTopY }).add(areaData)

    const heatmapOptions = {
        columns: traceDataArray[0].length,
        rows: traceDataArray.length,
        dataOrder: 'rows',
        yAxis: axisBottomY,
    }
    const heatmapSeries = chart
        .addHeatmapGridSeries(heatmapOptions)
        .setStart({
            x: CONFIG.opticalFibreDistanceStart,
            y: CONFIG.timeStart - dateOrigin,
        })
        .setStep({
            x: CONFIG.opticalFibreDistanceStep,
            y: CONFIG.timeStep,
        })
        .setIntensityInterpolation('disabled')
        .invalidateIntensityValues(traceDataArray)
        .setFillStyle(
            new PalettedFill({
                lookUpProperty: 'value',
                lut,
            }),
        )
        .setWireframeStyle(emptyLine)

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
