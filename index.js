let searchCo = document.querySelector('#searchCo')
let searchStock = document.querySelector("#search_stock")
let stockChart = document.querySelector('#chart')
let displaySearch = document.querySelector('#displaySearch')

const api = 'whatever our api is. need to make secret'

fetch(api)
.then(data => data.json)
.then(data => console.log(data))





searchStock.addEventListener('submit', (e) => {
    
    let stockName = document.createElement('div')
    stockName.textContent = e.LongName

    let stockPrice = document.createElement('div')
    stockPrice.textContent = e.price

    //start working on updating a graph here

    //possibly make tab for dropdown with advanced info (ex. year low, year high, etc)
})

searchCo.addEventListener('submit', (e) => {
    e.preventDefault();

    let company = document.createElement('div')
    let name = document.createElement('div')
    let recentTransaction = document.createElement('div')

    company.append(name, recentTransaction)

    company.id = e.Name //grabs company name creates div with id set to company name
    name.textContent = e.Name //sets text content of company name div = to company name then appends name to company div
    recentTransaction = e.TransactionDate // sets text content of recent transaction to the most recent transaction date. Going to have to have a seperate search for this one.
})