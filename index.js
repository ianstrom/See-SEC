google.charts.load("current", { "packages": ["corechart"] });
// google.charts.setOnLoadCallback(drawChart);
let searchCo = document.querySelector('#searchCo');
let searchStock = document.querySelector("#search_stock");
let stockChart = document.querySelector('#chart');
let displaySearch = document.querySelector('#displaySearch');
let defaultCompanyDisplay = ['FB', 'AMZN', 'AAPL', 'NFLX', 'GOOG'];
let companyCik;
let companyTicker;
let insiderCik;
let transactionDate;
let startDate;
let endDate;
let stockClosingPrices = []
let chartData = [["Date", "Closing Price"]]
let incrementDate;
let currentDate
let oneYearAgo
let timespan;
let date
let month
let day
let year

// const api = 'whatever our api is. need to make secret'

function displayCompanies() {
    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }
    defaultCompanyDisplay.forEach(company => {
        fetch(`https://api.aletheiaapi.com/GetEntity?id=${company}&key=${keys.aletheiaKey}`)
            .then(data => data.json())
            .then(data => {
                console.log(data)
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
            console.log(startDate, endDate)
            renderTransactions(data)
        })
        .catch(error => console.log(error))
}


function renderTransactions(data) {
    data.forEach(transaction => {
        let transacationContainer = document.createElement('div')
        let transactionQuantityContainer = document.createElement('div')
        let transactionQuantityOwnedContainer = document.createElement('div')
        let dateContainer = document.createElement('div')
        transactionDate = transaction.TransactionDate.slice(0, 10)
        transactionQuantityContainer.textContent = `Shares transferred: ${transaction.Quantity}`
        transactionQuantityOwnedContainer.textContent = `Shares after transaction: ${transaction.QuantityOwnedFollowingTransaction}`
        dateContainer.textContent = `Transaction date ${transactionDate}`
        transacationContainer.append(transactionQuantityContainer, transactionQuantityOwnedContainer, dateContainer)
        displaySearch.append(transacationContainer)
    })
    getStockData()
    getInsiderStockData()
}

function getStockData() {
    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/hour/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            console.log(data)
            getStockClosingValues(data)
        })
        .catch(error => console.log(error))
    }

function getStockClosingValues(data) {
    console.log(data)
    data.results.forEach(closingPrice => {
        stockClosingPrices.push(closingPrice.c)
    })
    console.log(stockClosingPrices)
}



searchCo.addEventListener('submit', (e) => {
    e.preventDefault();

    companyCik = e.target.company.value
    console.log(companyCik)

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

    console.log(data)

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
        title: "Mock Chart Title",
        curveType: "function",
        legend: { position: "bottom" }
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
    let currentDate1 = new Date(currentDate)
    let oneYearAgo1 = new Date(oneYearAgo)

    getWindowTimeSpan(currentDate1, oneYearAgo1)

    fetch(`https://api.polygon.io/v2/aggs/ticker/SPY/range/1/week/${oneYearAgo}/${currentDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
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
    let newDate = decideIncrement(date)
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
    return date;
}


function drawChartForInsider() {
    while (stockChart.firstChild){
        stockChart.removeChild(stockChart.firstChild)
    }
    let data = new google.visualization.DataTable()
    data.addColumn("string", "Date")
    data.addColumn("number", "Closing Price")
    data.addColumn({ type: "string", role: "annotation" })
    data.addColumn({ type: "string", role: "annotationText" })
    data.addRows(array2)
    let options = {
        title: "Mock Chart Title",
        curveType: "function",
        legend: { position: "bottom" },
        animation: {
            "startup": true,
            "duration": 1000,
            "easing": "linear"
        }
    }
    let chart = new google.visualization.LineChart(document.getElementById("chart"))
    chart.draw(data, options)
}

function getInsiderStockData() {
    let endDate1 = new Date(endDate)
    let startDate1 = new Date(startDate)
    getWindowTimeSpan(endDate1, startDate1)
    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/${timespan}/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            console.log(data)
            data.results.forEach(res => {
        })})
}

function getWindowTimeSpan(currentDate, date) {
    if (currentDate.getFullYear() - date.getFullYear() >= 1) {
        timespan = 'month'
        console.log('apps1')
    } else if (currentDate.getMonth() - date.getMonth() > 2 && currentDate.getMonth() - date.getMonth() < 12) {
        timespan = 'week'
        console.log('apps2')
    } else if (currentDate.getMonth() - date.getMonth() < 2 && currentDate.getDate() - date.getDate() > 7) {
        timespan = 'day'
        console.log('apps3')
    } else if (currentDate.getDate() - date.getDate() <= 7) {
        timespan = 'hour'
        console.log('apps4')
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
    return date;
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
    return date;
}

function decideIncrement(date) {
    if (timespan === 'month') {
        addOneMonth(date)
    } else if(timespan === 'week') {
        addOneWeek(date)
    } else if(timespan === 'day') {
        addOneDay(date)
    }
}