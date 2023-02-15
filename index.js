google.charts.load("current", { "packages": ["corechart"] });
// google.charts.setOnLoadCallback(drawChart);
let searchCo = document.querySelector('#searchCo');
let searchStock = document.querySelector("#search_stock");
let stockChart = document.querySelector('#chart');
let displaySearch = document.querySelector('#displaySearch');
let defaultCompanyDisplay = ['FB', 'AMZN', 'AAPL', 'NFLX', 'GOOG'];
let companyCik;
let companyTicker = 'SPY';
let insiderCik;
let transactionDate;
let startDate;
let endDate;
let transactionDateArray = []
let stockClosingPrices = []
let chartData = [["Date", "Closing Price"]]
let incrementDate;
let currentDate
let oneYearAgo
let timespan;
let startDate1
let transactionQuanitityArray = []
let insiderChartData = []
// let date
// let month
// let day
// let year

// const api = 'whatever our api is. need to make secret'

function displayCompanies() {
    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }
    defaultCompanyDisplay.forEach(company => {
        fetch(`https://api.aletheiaapi.com/GetEntity?id=${company}&key=${keys.aletheiaKey}`)
            .then(data => data.json())
            .then(data => {
                // console.log(data)
                let companyContainer = document.createElement('div')
                companyContainer.className = 'companies'
                companyContainer.textContent = data.Name
                displaySearch.append(companyContainer)
                renderPeopleInCompany(data, companyContainer)
            })
    })
}

displayCompanies()

function renderPeopleInCompany(data, clicked) {
    clicked.addEventListener('click', () => {
        companyCik = data.Cik
        companyTicker = data.TradingSymbol
        // console.log(companyCik)
        fetch(`https://api.aletheiaapi.com/AffiliatedOwners?id=${companyCik}&key=${keys.aletheiaKey}`)
            .then(people => people.json())
            .then(people => {
                renderPeople(people)
                // console.log(people)
            })
    })
}

function renderPeople(people) {
    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }
    people.forEach(person => {
        let insider = document.createElement('div')
        insider.className = 'insider'
        insider.textContent = person.Name
        displaySearch.append(insider)
        renderInsiderInfo(person, insider)
    })
}

function renderInsiderInfo(person, clicked) {
    clicked.addEventListener('click', () => {
        insiderCik = person.Cik
        while (displaySearch.firstChild) {
            displaySearch.removeChild(displaySearch.firstChild)
        }
        // console.log(insiderCik)
        renderInsider()
    })
}

function renderInsider() {
    fetch(`https://api.aletheiaapi.com/LatestTransactions?issuer=${companyCik}&owner=${insiderCik}&securitytype=0&top=10&key=${keys.aletheiaKey}`)
        .then(data => data.json())
        .then(data => {
            startDate = data[data.length - 1].TransactionDate.slice(0, 10)
            endDate = data[0].TransactionDate.slice(0, 10)
            renderTransactions(data)
        })
        .catch(error => alert('No Transaction Data Available'))
}


function renderTransactions(data) {
    data.forEach(transaction => {
        let transactionContainer = document.createElement('div')
        let transactionQuantityContainer = document.createElement('div')
        let transactionQuantityOwnedContainer = document.createElement('div')
        let dateContainer = document.createElement('div')
        transactionDate = transaction.TransactionDate.slice(0, 10)
        transactionDateArray.push(transactionDate)
        // console.log(new Date(transactionDateArray[0]).getMonth())
        transactionQuanitityArray.push(transaction.Quantity)
        // console.log(transactionQuanitityArray)
        transactionQuantityContainer.textContent = `Shares transferred: ${transaction.Quantity}`
        transactionQuantityOwnedContainer.textContent = `Shares after transaction: ${transaction.QuantityOwnedFollowingTransaction}`
        dateContainer.textContent = `Transaction date ${transactionDate}`
        transactionContainer.append(transactionQuantityContainer, transactionQuantityOwnedContainer, dateContainer)
        displaySearch.append(transactionContainer)
    })
    // getStockData()
    getInsiderStockData()
}

// function getStockData() {
//     fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/hour/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
//         .then(data => data.json())
//         .then(data => {
//             console.log(data)
//             getStockClosingValues(data)
//         })
//         .catch(error => alert('No Stock Data Available'))
//     }

// function getStockClosingValues(data) {
//     console.log(data)
//     data.results.forEach(closingPrice => {
//         stockClosingPrices.push(closingPrice.c)
//     })
//     // console.log(stockClosingPrices)
// }



searchCo.addEventListener('submit', (e) => {
    e.preventDefault();

    companyCik = e.target.company.value
    // console.log(companyCik)

    getCommonFinancials(companyCik)

})

function getCommonFinancials(Cik) {
    fetch(`https://api.aletheiaapi.com/CommonFinancials?id=${Cik}&period=1&key=${keys.aletheiaKey}`)
        .then(data => data.json())
        .then(data => renderCommonFinancials(data))
}

function renderCommonFinancials(data) {

    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }

    // console.log(data)

    let showInsider = document.createElement('button')
    let assets = document.createElement('div')
    let cash = document.createElement('div')
    let equity = document.createElement('div')
    let liabilities = document.createElement('div')
    let operatingIncome = document.createElement('div')
    let revenue = document.createElement('div')

    showInsider.textContent = 'Show Insider'
    assets.textContent = `Assets: ${data.Facts.Assets}`
    cash.textContent = `Cash: ${data.Facts.Cash}`
    equity.textContent = `Equity: ${data.Facts.Equity}`
    liabilities.textContent = `Liabilities: ${data.Facts.Liabilities}`
    operatingIncome.textContent = `Operating Income: ${data.Facts.OperatingIncome}`
    revenue.textContent = `Revenue: ${data.Facts.Revenue}`

    displaySearch.append(assets, cash, equity, liabilities, operatingIncome, revenue, showInsider)
    showInsider.addEventListener('click', () => {
        defaultCompanyDisplay = []
        defaultCompanyDisplay.push(`${companyCik}`)
        displayCompanies()
    })
}

function drawChart() {
    let data = google.visualization.arrayToDataTable(chartData);
    let options = {
        title: `${companyTicker}`,
        curveType: "function",
        legend: { position: "in" },
        animation: {
            "startup": true,
            "duration": 1000,
            "easing": "linear"
        },
        series: {
            0: {color: "#2BC5EB"}
        }
    }
    let chart = new google.visualization.LineChart(document.getElementById("chart"))
    chart.draw(data, options)
}

function getStock() {
    let date = new Date();
    let year = date.getFullYear()
    let whatIsAYearAgo = (date.getFullYear()) - 1
    let month = parseInt((date.getMonth()) + 1).toString()
    let day = date.getDate()


    if (month.length === 1) {
        month = '0' + month
    }

    if (day.length === 1) {
        day = '0' + day
    }

    let currentDate = `${year}-${month}-${day}`
    let oneYearAgo = `${whatIsAYearAgo}-${month}-${day}`
    // let currentDate1 = new Date(currentDate)
    // let oneYearAgo1 = new Date(oneYearAgo)

    // getWindowTimeSpan(currentDate1, oneYearAgo1)

    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/week/${oneYearAgo}/${currentDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => data.results.forEach(week => {
            oneYearAgo = new Date(oneYearAgo)
            populateChartData(week, oneYearAgo)
            drawChart()
        }))
}

getStock()

function populateChartData(week, date) {
    let chartDataNestedArray = []
    let newDate = addOneWeek(date)
    chartDataNestedArray.push(newDate)
    chartDataNestedArray.push(week.c)
    chartData.push(chartDataNestedArray)
}

function addOneWeek(date) {
    date.setDate(date.getDate() + 7);
    let month = parseInt((date.getMonth()) + 1).toString();
    let day = date.getDate();
    let year = date.getFullYear();

    if (month.length === 1) {
        month = '0' + month
    }

    if (day.length === 1) {
        day = '0' + day
    }

    date = `${year}-${month}-${day}`
    return date
}


function drawChartForInsider() {
    while (stockChart.firstChild) {
        stockChart.removeChild(stockChart.firstChild)
    }
    let data = new google.visualization.DataTable()
    data.addColumn("string", "Date")
    data.addColumn("number", "Closing Price")
    data.addColumn({ type: "string", role: "annotation" })
    data.addColumn({ type: "string", role: "annotationText" })
    data.addRows(insiderChartData)
    let options = {
        title: `${companyTicker}`,
        curveType: "function",
        legend: { position: "in" },
        animation: {
            "startup": true,
            "duration": 1000,
            "easing": "linear"
        },
        series: {
            0: {color: "#2BC5EB"}
        },
        annotations: {
            boxStyle: {
                // Color of the box outline.
                stroke: '#888',
                // Thickness of the box outline.
                strokeWidth: 1,
                // x-radius of the corner curvature.
                rx: 10,
                // y-radius of the corner curvature.
                ry: 10,
                // Attributes for linear gradient fill.
                gradient: {
                    // Start color for gradient.
                    color1: '#FBF6A7',
                    // Finish color for gradient.
                    color2: '#33B679',
                    // Where on the boundary to start and
                    // end the color1/color2 gradient,
                    // relative to the upper left corner
                    // of the boundary.
                    x1: '0%', y1: '0%',
                    x2: '100%', y2: '100%',
                    // If true, the boundary for x1,
                    // y1, x2, and y2 is the box. If
                    // false, it's the entire chart.
                    useObjectBoundingBoxUnits: true
                }
            }
        }
    }
    let chart = new google.visualization.LineChart(document.getElementById("chart"))
    chart.draw(data, options)
}

function getInsiderStockData() {
    let endDate1 = new Date(endDate)
    startDate1 = new Date(startDate)
    getWindowTimeSpan(endDate1, startDate1)
    // console.log(startDate1)
    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/${timespan}/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            // console.log(data)
            data.results.forEach(res => {
                populateInsiderChartData(res)
                decideIncrement(startDate1)
                drawChartForInsider()
            })
        })
}

function getWindowTimeSpan(currentDate, date) {
    if (currentDate.getFullYear() - date.getFullYear() >= 1) {
        timespan = 'month'
    } else if (currentDate.getMonth() - date.getMonth() > 2 && currentDate.getMonth() - date.getMonth() < 12) {
        timespan = 'week'
    } else if (currentDate.getMonth() - date.getMonth() < 2 && currentDate.getDate() - date.getDate() > 7) {
        timespan = 'day'
    } else if (currentDate.getDate() - date.getDate() <= 7) {
        timespan = 'hour'
    }
}

function addOneMonth(date) {
    date.setDate(date.getDate() + 30);
    let month = parseInt((date.getMonth()) + 1).toString();
    let day = date.getDate();
    let year = date.getFullYear();

    if (month.length === 1) {
        month = '0' + month
    }

    if (day.length === 1) {
        day = '0' + day
    }

    date = `${year}-${month}-${day}`
    return date
}

function addOneDay(date) {
    date.setDate(date.getDate() + 1);
    let month = parseInt((date.getMonth()) + 1).toString();
    let day = date.getDate();
    let year = date.getFullYear();

    if (month.length === 1) {
        month = '0' + month
    }

    if (day.length === 1) {
        day = '0' + day
    }

    date = `${year}-${month}-${day}`
    return date
}

function decideIncrement(date) {
    if (timespan === 'month') {
        addOneMonth(date)
    } else if (timespan === 'week') {
        addOneWeek(date)
    } else if (timespan === 'day') {
        addOneDay(date)
    }
}

function decideComparison() {
    if (timespan === 'month') {
        return compareMonths()
    } else if (timespan === 'week') {
        return compareWeeks()
    } else if (timespan === 'day') {
        return compareDays()
    } else if (timespan === 'hour') {
        return compareDays()
    }
    transactionDateArray.shift()
    transactionQuanitityArray.shift()
}

function compareMonths() {
    if (startDate1.getMonth() === new Date(transactionDateArray[0]).getMonth()) {
        transactionDateArray.shift();
        return (transactionQuanitityArray[0]).toString()
    } else {
        return ''
    }
}

function compareWeeks() {
    if (startDate1.getDate() - new Date(transactionDateArray[0]).getDate() <= 7 && startDate1.getMonth() === new Date(transactionDateArray[0]).getMonth()) {
        transactionDateArray.shift()
        return (transactionQuanitityArray[0]).toString()
    } else {
        return ''
    }
}

function compareDays() {
    if (startDate1 === new Date(transactionDateArray[0])) {
        transactionDateArray.shift()
        return (transactionQuanitityArray[0]).toString()
    } else {
        return ''
    }
}

function populateInsiderChartData(res) {
    let insiderChartDataNestedArray = []
    let newDate = formatDate(startDate1)
    insiderChartDataNestedArray.push(newDate)
    insiderChartDataNestedArray.push(res.c)
    insiderChartDataNestedArray.push(".")
    insiderChartDataNestedArray.push(decideComparison())
    // console.log(decideComparison())
    // console.log(insiderChartDataNestedArray)
    insiderChartData.push(insiderChartDataNestedArray)
}

function formatDate(date3) {
    let fuckingDate = new Date(date3);
    let year = fuckingDate.getFullYear()
    let month = parseInt((fuckingDate.getMonth()) + 1).toString()
    let day = fuckingDate.getDate()

    if (month.length === 1) {
        month = '0' + month
    }

    if (day.length === 1) {
        day = '0' + day
    }

    let currentDate = `${year}-${month}-${day}`
    return currentDate;
}


searchStock.addEventListener('submit', (e) => {
    e.preventDefault();

    companyTicker = e.target.ticker_company.value
    getStock()
}) 