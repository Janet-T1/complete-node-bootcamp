// Getting our file module ready 
const { error } = require('console');
const fs = require('fs'); 
const http = require('http'); 
const url = require('url'); 

// a function that is used to create slugs 
// slugs: the last part of the url that contains the name of the current page 
// localhost:8000/products?id=1 becomes 
const slugify = require('slugify'); 

//impoting our own module 

const replaceTemplate = require('./final/modules/replaceTemplate.js')
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FILES 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // SYNCHRONOUS FILE READING AND WRITING: Blcoking code 

// // 1st argument: file path of the file we want to read 
// // 2nd argument: the character encoding (if we don't define this, we will get something called buffer instead of readable characters)
// const textIn = fs.readFileSync('./final/txt/input.txt', 'utf-8'); 
// console.log(textIn); 

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`; 
// fs.writeFileSync('./final/txt/output.txt', textOut); 
// console.log("File written!"); 

// ASYNCHRONOUS FILE READING AND WRITING: Non-blocking code 

// 1st argument: file path of the file we want to read 
// 2nd argument: the callback function (output variables: err: the error in case there was any, data: the atual read data)

// This is called the callback hell (especially when there are a lot more callbacks)
// fs.readFile("./final/txt/start.txt", 'utf-8', (err, data1) => {
//     if (err) return console.log("ERROR!"); 

//     fs.readFile(`./final/txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2); 
//         fs.readFile("./final/txt/append.txt", 'utf-8', (err, data3) => {
//             console.log(data3); 
            
//             fs.writeFile('/final/txt/final.txt', `${data2}\n${data3}`, 'utf-8',  err => {
//                 console.log("Your file has been written"); 
//             })
//         })
//     })
// })

// // This line of code will first run as we are employing asynchronous reading 
// // reading a file takes more time than just simply outputting something to the console log 
// console.log('Currently reading file...')

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SERVER 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// We will be using the synchrous version of reading a file 
// This would typically be a problem since using this code will only get executed once
// And we don't want this to be inside the createServer function since we don't want to be 
// reading the file again and again every time a /api request is made 
const data = fs.readFileSync('./final/dev-data/data.json','utf-8'); 
const tempOverview = fs.readFileSync('./final/templates/template-overview.html','utf-8'); 
const tempProduct = fs.readFileSync('./final/templates/template-product.html','utf-8'); 

const tempCard = fs.readFileSync('./final/templates/template-card.html', 'utf-8')
const dataObj = JSON.parse(data)

const slugs = dataObj.map(el => slugify(el.productName, {lower: true})); 
console.log(slugs); 


// Creating our server 
// 1. create our server using createServer function, and passed in a call-back function 
// that is executed each time there is a new request to the server
// 2. listening for incoming server requests on the local host IP on  port 8000 


const server = http.createServer((req, res) => {

    // With these 2 exact property names 
    // 2 variables will be created, called query and pathname 
    // with the given values 
    // example: query: {id: '0'}
    //          pathname: '/product'
    const {query, pathname} = url.parse(req.url, true)

    // console.log(req.url)


    // We want to be able to parse through the actual url values 
    // For example, right now all we have is 
    // /product?id=1, and in our if-else clause for routing, we don't have a case 
    // for this specific url, so we want to be able to parse through the url 

    // We have 'true' as one of pur parameters because we want to be able to pass the query 
    // the query is followed after the question mark in /product?id=1
    
    // console.log(url.parse(req.url, true))

    // implementing the routing 

    // Overview page 
    if (pathname === '/' || pathname === "/overview") {
        res.writeHead(200, {'Content-type':'text/html'});

        // Loop through each data object in the list (in data.json file) in a map 
        // parameters: 
        // el: refers to the element in the current loop; el is short for element 
        // for each element we are looping through, we will return something, 
        // and that returned value will then be stored in our variable 'cardsHtml' which is an array

        // Purpose of this loop: to replace the placeholders 
        // Now that we have an array: cardsHtml - of our javascript elements, we want one big string 
        // that contains all the values: we do this by the join() function and we join it using an empty string 
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join(''); 
        
        // Now we will replace our place holder in template-overview

        const out = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml); 

        // Now, our browser will respond with the replaced template overview
        res.end(out); 

        
        // console.log(cardsHtml); 
        
       
    // Product page
    } else if (pathname === '/product') {

        // each product is at the index that is its id (this is why id should always start with 0!!) 
        // so if we have avocados with id 0, then that product will be found in index 0 from the array dataObj 
        // product is whatever element of dataObj that has been queried based on the element's id value 
        const product = dataObj[query.id]; 
        const output = replaceTemplate(tempProduct, product); 
        
        res.end(output); 

    // API
    } else if (pathname === '/api') {
           
        // telling the browser that we will be sending a JSON data type 
        res.writeHead(200, {'Content-type':'application/json'});
        // sending back the actual string data  
        res.end(data);
    
    // Not found 
    } else {

        // We can also write HTTP headers 
        // Headers are pieces of information about the response that we are sending back 
        res.writeHead(404, {
            'Content-type': 'text/html', 
            'my-own-header': 'Hello World!'

        })
        res.end("<h1>Page not found!</h1>"); 
        // 404 is a HTTP status code 
    }

   
}); 

// req.url gives us 2 different requests, 
// 1. / 
// 2. /favicon.ico 
//  The first one is just the request of the browser itself, 
// while the second request comes automatically from the browser for the favicon for the site 


// 8000: port number (a subaadress on a certain host)
// 127.0.0.1 Standard IP address for the local host 
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000...'); 
})

// at the point above, the node cannot really exit the  program because it is waiting for requests 

// For now, an API is a service from which we can request some data 