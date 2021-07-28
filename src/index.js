/*
 * LightningChartJS example that showcases a real life application used in Fiber Monitoring
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Extract required parts from LightningChartJS.
const {
    lightningChart,
    AxisTickStrategies,
    emptyLine, 
    emptyFill, 
    AreaSeriesTypes, 
    ColorRGBA,
    PalettedFill, 
    LUT, 
    emptyTick,
    UIElementBuilders, 
    UIOrigins,
    Themes
} = lcjs

const {
    createProgressiveTraceGenerator
} = require('@arction/xydata')

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
    timeEnd: new Date('2021-06-17T08:54:38').getTime()
}

// All Axis coordinates on Date Axis are offset by this value to prevent zooming issues.
const dateOrigin = CONFIG.timeStart

const lut = new LUT({
    interpolate: false,
    steps: [
        { value: 0, color: ColorRGBA(0, 0, 0, 0) },
        { value: 200, color: ColorRGBA(96, 146, 237) },
        { value: 300, color: ColorRGBA(0, 0, 255) },
        { value: 400, color: ColorRGBA(255, 215, 0) },
        { value: 500, color: ColorRGBA(255, 164, 0) },
        { value: 600, color: ColorRGBA(255, 64, 0) },
    ],
})

const dataPromise = new Promise(async (resolve) => {
    const timeStepsCount = Math.ceil((CONFIG.timeEnd - CONFIG.timeStart) / CONFIG.timeStep)
    const opticalFibreLengthX = Math.ceil((CONFIG.opticalFibreDistanceEnd - CONFIG.opticalFibreDistanceStart) / CONFIG.opticalFibreDistanceStep)
    const traceDataArray = await Promise.all(
        new Array(timeStepsCount).fill(0).map((_, i) => 
            createProgressiveTraceGenerator()
                .setNumberOfPoints(opticalFibreLengthX)
                .generate()
                .toPromise()
                .then(xyPoints => xyPoints.map(xy => Math.abs( xy.y * 100 )))
        )
    )
    // `traceDataArray` can be supplied into heat map series as is,
    // calculate data for Area Series by summing every trace column value for every X coordinate.
    const areaData = new Array(opticalFibreLengthX).fill(0).map((_, iX) => ({
        x: CONFIG.opticalFibreDistanceStart + iX * CONFIG.opticalFibreDistanceStep,
        y: traceDataArray.reduce((sum, cur) => sum + cur[iX], 0)
    }))
    
    resolve({
        traceDataArray,
        areaData
    })
})

const dashboard = lightningChart().Dashboard({
    // theme: Themes.darkGold
    numberOfColumns: 1,
    numberOfRows: 2,
})
    .setRowHeight(0, 0.3)
    .setRowHeight(1, 0.7)

const chartTop = dashboard.createChartXY({
    rowIndex: 0,
    columnIndex: 0,
})
    .setTitle('Distance Intensity Chart')
    .setPadding({ right: 24 })

const axisTopX = chartTop.getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.Empty)
    .setStrokeStyle(emptyLine)

const axisTopY = chartTop.getDefaultAxisY()
    .setTitle('Intensity Sum')

const chartBottom = dashboard.createChartXY({
    rowIndex: 1,
    columnIndex: 0,
})
    .setTitleFillStyle(emptyFill)
    .setPadding({ right: 24 })

const axisBottomX = chartBottom.getDefaultAxisX()
    .setTitle('Optical Fiber Distance (m)')

const formatterOptionsDateTimeAxis = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
}

const axisBottomY = chartBottom.getDefaultAxisY()
    .setTitle('Time')
    .setTickStrategy(AxisTickStrategies.DateTime, (ticks) => ticks
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
        .setFormattingYear(formatterOptionsDateTimeAxis, {})
    )


// Code for synchronizing all X Axis intervals in stacked XY charts.
let isAxisXScaleChangeActive = false
const syncAxisXEventHandler = (axis, start, end) => {
   if (isAxisXScaleChangeActive) return
   isAxisXScaleChangeActive = true

   // Find all other X Axes.
   const otherAxes = axis === axisBottomX ? [axisTopX] : [axisBottomX]

   // Sync other X Axis intervals.  
   otherAxes.forEach((axis) => axis
      .setInterval(start, end, false, true)
   )

   isAxisXScaleChangeActive = false
}
axisBottomX.onScaleChange((start, end) => syncAxisXEventHandler(axisBottomX, start, end))
axisTopX.onScaleChange((start, end) => syncAxisXEventHandler(axisTopX, start, end))


// Synchronize left margin of stacked Y Axes' by adding invisible custom ticks with hard coded width.
;[axisTopY, axisBottomY].forEach((axis) => axis
    .addCustomTick(UIElementBuilders.AxisTick)
        .setTickLength(120)
        // Following code makes the tick invisible.
        .setTextFormatter(() => "")
        .setGridStrokeStyle(emptyLine)
        .setMarker((marker) => marker.setTickStyle(emptyLine))

)


// Visualize data.
dataPromise.then(data => {
    const { traceDataArray, areaData } = data

    const areaSeries = chartTop.addAreaSeries({type: AreaSeriesTypes.Positive})
        .add(areaData)
        .setCursorResultTableFormatter((builder, series, x, y) => builder
            .addRow('Intensity sum:', '', y.toFixed(1))
            .addRow('Optical fiber distance:', '', axisBottomX.formatValue(x) + ' m')
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
        dataOrder: 'rows'
    }
    const heatmapSeries = chartBottom.addHeatmapGridSeries(heatmapOptions)
        .setPixelInterpolationMode('disabled')
        .invalidateIntensityValues(traceDataArray)
        .setFillStyle(new PalettedFill({
            lookUpProperty: 'value',
            lut
        }))
        .setWireframeStyle(emptyLine)
        .setCursorResultTableFormatter((builder, series, dataPoint) => builder
            .addRow('Intensity:', '', dataPoint.intensity.toFixed(1))
            .addRow('Optical fiber distance:', '', axisBottomX.formatValue(dataPoint.x) + ' m')
            .addRow('Time:', '', axisBottomY.formatValue(dataPoint.y))
        )

    axisBottomX.fit(false)
    axisBottomY.fit(false)
    axisTopX.fit(false)
    axisTopY.fit(false)

    chartBottom.setPadding({
        bottom: 64
    })

    const lutRange = chartBottom.addUIElement(UIElementBuilders.LUTRange)
        .setLUT(lut)
        .setLUTLength(500)
        .setPosition({ x: 50, y: 0 })
        .setOrigin(UIOrigins.CenterBottom)
        .setAutoDispose({
            type: 'max-width',
            maxWidth: 0.80,
        })
        .setBackground(background => background
            .setFillStyle(emptyFill)
            .setStrokeStyle(emptyLine)
        )

})
