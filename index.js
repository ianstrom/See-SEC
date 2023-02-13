let searchCoP = document.querySelector('#searchCoP');
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

// const api = 'whatever our api is. need to make secret'



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
        console.log(transactionDate)
    })
    getStockData()
}

function getStockData() {
    fetch(`https://api.polygon.io/v2/aggs/ticker/${companyTicker}/range/1/hour/${startDate}/${endDate}?adjusted=true&sort=asc&limit=120&apiKey=${keys.aggregateKey}`)
        .then(data => data.json())
        .then(data => {
            console.log(data)
            getStockClosingValues(data)
        })
}

function getStockClosingValues(data) {
    data.results.forEach(closingPrice => {
        stockClosingPrices.push(closingPrice.c)
    })
    console.log(stockClosingPrices)
}

searchStock.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e.target.ticker_company.value)

    let stockName = document.createElement('div')
    stockName.textContent = e.LongName

    let stockPrice = document.createElement('div')
    stockPrice.textContent = e.price

    //start working on updating a graph here

    //possibly make tab for dropdown with advanced info (ex. year low, year high, etc)
})

searchCoP.addEventListener('submit', (e) => {
    e.preventDefault();

    console.log("hi")
    let company = document.createElement('div')
    let name = document.createElement('div')
    let recentTransaction = document.createElement('div')

    company.append(name, recentTransaction)
    displaySearch.append(company)

    company.id = e.Name //grabs company name creates div with id set to company name
    name.textContent = e.Name //sets text content of company name div = to company name then appends name to company div
    recentTransaction = e.TransactionDate // sets text content of recent transaction to the most recent transaction date. Going to have to have a seperate search for this one.
})