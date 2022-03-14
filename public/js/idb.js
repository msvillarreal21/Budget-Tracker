//create variable to hold db connection
let db;

//establish a connection to database 
const request = indexedDB.open('budget', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    
    db.createObjectStore('pending', { autoIncrement: true });
  };

  // upon a successful 
request.onsuccess = function(event) {
   
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
     uploadPending();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

  // This function will be executed if we attempt to submit a entry and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['pending'], 'readwrite');
    console.log(transaction);
  
    // access the object store for `budget`
    const store = transaction.objectStore('pending');

    console.log(store)
    console.log("This is the record " + {record})
  
    // add record to your store with add method
    store.add(record);
  }

function uploadPending(){
    //open a transaction on your db
    const transaction = db.transaction(['pending'], 'readwrite');
    
    //access your object store
    const store = transaction.objectStore('pending');

    //get all records from store and set to a variable
    const getAll = store.getAll();

// upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if(getAll.result.length > 0) {
      fetch('/api/tansaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
            
          }
          // open one more transaction
          const transaction = db.transaction(['pending'], 'readwrite');

          // access the budget object store
          const store = transaction.objectStore('pending')

          // clear all items in your store
          store.clear();

          alert('All transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
       }
     }
    }
// listen for app coming back online
window.addEventListener('online', uploadPending);