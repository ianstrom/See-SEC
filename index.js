let searchCoP = document.querySelector('#searchCoP');
let searchStock = document.querySelector("#search_stock");
let stockChart = document.querySelector('#chart');
let displaySearch = document.querySelector('#displaySearch');
let defaultCompanytDisplay = ['FB', 'AMZN', 'AAPL', 'NFLX', 'GOOG'];
let companyCik;
let insiderCik;

// const api = 'whatever our api is. need to make secret'


// fetch(`https://api.aletheiaapi.com/LatestTransactions?issuer=1800&top=5&key=${keys.ianKey}`)
// .then(data => data.json())
// .then(data => console.log(data))



defaultCompanytDisplay.forEach(company => {
    fetch(`https://api.aletheiaapi.com/GetEntity?id=${company}&key=${keys.ianKey}`)
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
        console.log(companyCik)
        fetch(`https://api.aletheiaapi.com/AffiliatedOwners?id=${companyCik}&key=${keys.ianKey}`)
            .then(people => people.json())
            .then(people => {
                renderPeople(people)
                console.log(people)
                // console.log(people[0].Cik)
            })
    })
}

// fetch(`https://api.aletheiaapi.com/LatestTransactions?issuer=${companyCik}&owner=${insiderCik}securitytype=0&transactiontype=13&top=10&key=${keys.ianKey}`)



function renderPeople(people) {
    while (displaySearch.firstChild) {
        displaySearch.removeChild(displaySearch.firstChild)
    }
    people.forEach(person => {
        let insider = document.createElement('div')
        insider.className = 'insider'
        insider.textContent = person.Name
        displaySearch.append(insider)
        renderInsiderInfo(people, insider)
    })
}

function renderInsiderInfo(people, clicked) {
    people.forEach(person => {
        clicked.addEventListener('click', () => {
            insiderCik = person.Cik
            while(displaySearch.firstChild) {
                displaySearch.removeChild(displaySearch.firstChild)
            }
            // console.log(insiderCik)
        })
    })
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