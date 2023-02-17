google.charts.load("current", { "packages": ["corechart"] });
let searchCoForm = document.querySelector('.searchCoForm');
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
let chartData = [["Date", "Closing Price"]]
let currentDate
let oneYearAgo
let timespan;
let transactionQuanitityArray = []
let insiderChartData = []
let twoYearsAgo
let splicingData
let dataSplitAndReversed
let startDatePiss

function displayCompanies() {
    clearDisplaySearch()
    defaultCompanyDisplay.forEach(company => {
        fetch(`https://api.aletheiaapi.com/GetEntity?id=${company}&key=${keys.aletheiaKey}`)
            .then(data => data.json())
            .then(data => {
                let companyContainer = document.createElement('div')
                companyContainer.className = 'infoContainer'
                companyContainer.textContent = data.Name
                displaySearch.append(companyContainer)
                renderPeopleInCompany(data, companyContainer)
                //Loads FAANG companies and displays them in the Display Search Container uses names provided from the API call to change the text content
            })
            .catch(error => alert('Company Is Not Monitored'))
    })
}

displayCompanies()

function renderPeopleInCompany(data, clicked) {
    clicked.addEventListener('click', () => {
        companyCik = data.Cik
        companyTicker = data.TradingSymbol
        fetch(`https://api.aletheiaapi.com/AffiliatedOwners?id=${companyCik}&key=${keys.aletheiaKey}`)
            .then(people => people.json())
            .then(people => {
                clearDisplaySearch()
                renderPeople(people)
                //Adds an event listener to the company container then when clicked, gets all of that afilliated share holders of the company that is clicked then clears the display search container.
            })
            .catch(error => alert('No Affiliated Share Holders Monitored'))
    })
}

function renderPeople(people) {
    people.forEach(person => {
        let insider = document.createElement('div')
        insider.className = 'infoContainer'
        insider.textContent = person.Name
        displaySearch.append(insider)
        renderInsiderInfo(person, insider)
        //Displays all affiliated owners in the display search container
    })
}

function renderInsiderInfo(person, clicked) {
    clicked.addEventListener('click', () => {
        insiderCik = person.Cik
        renderInsider()
        //Adds an event listener on the insider container then when clicked, assigns the insiderCik to the affiliated owners Cik
    })
}

function renderInsider() {
    fetch(`https://api.aletheiaapi.com/LatestTransactions?issuer=${companyCik}&owner=${insiderCik}&securitytype=0&top=10&key=${keys.aletheiaKey}`)
        .then(data => data.json())
        .then(data => {
            startDate = data[data.length - 1].TransactionDate.slice(0, 10)
            endDate = data[0].TransactionDate.slice(0, 10)
            clearDisplaySearch()
            renderTransactions(data)
        })
        .catch(error => alert('No Recent Transactions Available'))
    //When called, assigns dates to start date and end date accoding to the first and last index dates
}

function getStockChartDates(data) {
    splicingData = [...data]
    splicingData = splicingData.reverse()
    let twoYearsAgoJs = new Date(twoYearsAgo)
    const index = splicingData.findIndex(transaction => new Date(transaction.TransactionDate) >= twoYearsAgoJs);
    dataSplitAndReversed = splicingData.slice(index);
    dataSplitAndReversed.forEach(transaction => {
        if (transaction.length == 1) {
            fetchForOneDay(transaction)
        } else {
            transactionDateArray.push(transaction.TransactionDate.slice(0, 10))
            getforMultipleDays(transaction)
            transactionDateArray.shift()
        }
    })
    //Takes in the display companies data, copies it into a new array, then reverses the array, then finds the index where the transaction date is more recent than two years ago, then removes everything before that index and assigns the remaining data points in the
    //array and assigns it to dataSplitAndReversed variable then if the array only has one item, it calls fetchForOneDay, and anything greater than one passes all the dates from each item to a new array then called getForMultipleDays and then removes the first item from the array
}

function renderTransactions(data) {
    data.forEach(transaction => {
        let transactionContainer = document.createElement('div')
        transactionContainer.className = 'infoContainer'
        let transactionQuantityContainer = document.createElement('div')
        let transactionQuantityOwnedContainer = document.createElement('div')
        let dateContainer = document.createElement('div')
        transactionDate = transaction.TransactionDate.slice(0, 10)
        transactionQuantityContainer.textContent = `Shares transferred: ${transaction.Quantity}`
        transactionQuantityOwnedContainer.textContent = `Shares after transaction: ${transaction.QuantityOwnedFollowingTransaction}`
        dateContainer.textContent = `Transaction date ${transactionDate}`
        transactionContainer.append(transactionQuantityContainer, transactionQuantityOwnedContainer, dateContainer)
        displaySearch.append(transactionContainer)
    })
    getStockChartDates(data)
    //When called, displays all transaction data in the display search container.
}

searchCoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    companyCik = e.target.company.value

    getCommonFinancials(companyCik)

    e.target.reset()
    //Adds an event listener to the search company container that when submitted, calls get common financials
})

function getCommonFinancials(Cik) {
    fetch(`https://api.aletheiaapi.com/CommonFinancials?id=${Cik}&period=1&key=${keys.aletheiaKey}`)
        .then(data => data.json())
        .then(data => {
            clearDisplaySearch()
            renderCommonFinancials(data)
        })
    //When called, clears the display search container
}

function renderCommonFinancials(data) {
    let companyInfoContainer = document.createElement('div')
    companyInfoContainer.className = 'companyInfoContainer'
    let showInsider = document.createElement('button')
    let assets = document.createElement('div')
    let cash = document.createElement('div')
    let equity = document.createElement('div')
    let liabilities = document.createElement('div')
    let operatingIncome = document.createElement('div')
    let revenue = document.createElement('div')
    revenue.className = 'insiderData'
    showInsider.className = 'insiderData'
    showInsider.id = 'insider'
    assets.className = 'insiderData'
    cash.className = 'insiderData'
    equity.className = 'insiderData'
    liabilities.className = 'insiderData'
    operatingIncome.className = 'insiderData'

    showInsider.textContent = 'Show Insider'
    assets.textContent = `Assets: ${data.Facts.Assets}`
    cash.textContent = `Cash: ${data.Facts.Cash}`
    equity.textContent = `Equity: ${data.Facts.Equity}`
    liabilities.textContent = `Liabilities: ${data.Facts.Liabilities}`
    operatingIncome.textContent = `Operating Income: ${data.Facts.OperatingIncome}`
    revenue.textContent = `Revenue: ${data.Facts.Revenue}`

    companyInfoContainer.append(assets, cash, equity, liabilities, operatingIncome, revenue, showInsider)
    displaySearch.append(companyInfoContainer)
    showInsider.addEventListener('click', () => {
        defaultCompanyDisplay = []
        defaultCompanyDisplay.push(`${companyCik}`)
        displayCompanies()
    })
    //When called, displays company information in the display search container and adds an even listener to show insider button that displays the company that you searched 
}

function drawChart() {
    let data = google.visualization.arrayToDataTable(chartData);
    let options = {
        title: `${companyTicker}`,
        hAxis: {
            slantedText: true,
            viewWindowMode: "pretty"
        },
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            keepInBounds: true
        },
        curveType: "function",
        legend: {
            position: "in",
            alignment: "end"
        },
        animation: {
            "startup": true,
            "duration": 1000,
            "easing": "linear"
        }
    }
    let chart = new google.visualization.LineChart(document.getElementById("chart"))
    chart.draw(data, options)
    //when called draws chart
}

function getStock() {
    let date = new Date();
    let year = date.getFullYear()
    let whatIsAYearAgo = (date.getFullYear()) - 1
    let whatIsTwoYearsAgo = (date.getFullYear()) - 2
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
    twoYearsAgo = `${whatIsTwoYearsAgo}-${month}-${day}`

    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/week/${oneYearAgo}/${currentDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => data.results.forEach(week => {
            oneYearAgo = new Date(oneYearAgo)
            populateChartData(week, oneYearAgo)
            drawChart()
        }))
        //When called, gets the current date and also the date from one year ago and correctly formats it, passes those dates into a fetch request to get stock data from one year ago until now and calls draw chart
}

getStock()

function populateChartData(week, date) {
    let chartDataNestedArray = []
    let newDate = addOneWeek(date)
    chartDataNestedArray.push(newDate)
    chartDataNestedArray.push(week.c)
    chartData.push(chartDataNestedArray)
    //When called, formats all the data on the stock chart in the api's desired format
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
    //when called, increments the start date by 7 days
}


function drawChartForInsider() {
    clearDisplaySearch()
    let data = new google.visualization.DataTable()
    data.addColumn("string", "Date")
    data.addColumn("number", "Closing Price")
    data.addColumn({ type: "string", role: "annotation" })
    data.addColumn({ type: "string", role: "annotationText" })
    data.addRows(insiderChartData)
    let options = {
        title: `${companyTicker}`,
        hAxis: {
            slantedText: true,
            viewWindowMode: "pretty"
        },
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            keepInBounds: true
        },
        curveType: "function",
        legend: {
            position: "in",
            alignment: "end"
        },
        animation: {
            "startup": true,
            "duration": 1000,
            "easing": "out"
        },
        series: {
            0: { color: "#2BC5EB" }
        },
        annotations: {
            textStyle: {
                color: 'black'
            },
            boxStyle: {

                gradient: {

                    color1: '#FFFFFF',

                    color2: '#FFFFFF',

                    x1: '0%', y1: '0%',
                    x2: '100%', y2: '100%',

                    useObjectBoundingBoxUnits: true
                }
            }
        }
    }
    let chart = new google.visualization.LineChart(document.getElementById("chart"))
    chart.draw(data, options)
    //Draws a chart with more data being passed in
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
    //Compares the start date to the end date and decides the distance in dates between each stock price
}

function populateInsiderChartData(res) {
    let insiderChartDataNestedArray = []
    insiderChartDataNestedArray.push(startDate)
    insiderChartDataNestedArray.push(res.c)
    let myIcon = `$`
    if (transactionQuanitityArray.length > 0) {
        insiderChartDataNestedArray.push(myIcon)
        insiderChartDataNestedArray.push(`Shares Transferred: ${transactionQuanitityArray[0].toString()}`)
        transactionQuanitityArray.shift()
    } else {
        insiderChartDataNestedArray.push("")
        insiderChartDataNestedArray.push('')
    }
    insiderChartData.push(insiderChartDataNestedArray)
    //When called, formats all the data on the stock chart in the api's desired format
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
    //Creates a variable that is assigned the current date in YYYY-MM-DD format
}


searchStock.addEventListener('submit', (e) => {
    e.preventDefault();

    companyTicker = e.target.ticker_company.value

    e.target.reset()

    getStock();
    //Adds an event listener to the search stock container that when submitted, calls gets the desired stock data for the past year and displays it on the chart
})

function clearDisplaySearch() {
    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }
    //Clears the display search container
}

function fetchForOneDay(transaction) {
    transactionQuanitityArray.push(transaction.Quantity)
    startDate = transaction.TransactionDate.slice(0, 10)
    startDatePiss = new Date(startDate)
    endDate = startDatePiss.setDate(startDatePiss.getDate() + 1)

    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/hour/${startDate}/${endDate}?adjusted=true&sort=asc&limit=50000&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            data.results.forEach(res => {
                populateInsiderChartData(res)
                drawChartForInsider()
            })
        })
    //When called, pushes the amount of shares transferred from the transaction to the transaction quantity array to be accessed later and also assigns start date to the transaction date and the end date to the start date + 1 day, then populates the chart with that information
}

function getforMultipleDays(transaction) {
    transactionQuanitityArray.push(transaction.Quantity)
    startDate = transaction.TransactionDate.slice(0, 10)

    fetch(`https://api.polygon.io/v1/open-close/${companyTicker}/${transactionDateArray[0]}?adjusted=true&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            console.log(data)
            populateInsiderChartData2(data)
            drawChartForInsider()
        }
        )
        //When called, pushes the amount of shares transferred from each transaction to the transaction quanity array to be accesses later, then calls the api for every transaction date and populates the chart with the stock data
}

function populateInsiderChartData2(res) {
    let insiderChartDataNestedArray = []
    insiderChartDataNestedArray.push(res.from)
    insiderChartDataNestedArray.push(res.close)

    let myIcon = `$`

    if (transactionQuanitityArray.length > 0) {
        insiderChartDataNestedArray.push(myIcon)
        insiderChartDataNestedArray.push(`Shares Transferred: ${transactionQuanitityArray[0].toString()}`)
        transactionQuanitityArray.shift()
    } else {
        insiderChartDataNestedArray.push("")
        insiderChartDataNestedArray.push('')
    }
    insiderChartData.push(insiderChartDataNestedArray)
    //When called, formats all the data in the api's desired format.
}