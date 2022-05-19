const pause = document.getElementById('pause');
const add = document.getElementById("Add");
const admin = document.getElementById("Admin");
const plan = document.getElementById("Plan");
const login = document.getElementById("login");
const planBtn = document.getElementById("planButton");

let products;
let op = ["increase", "decrease", "reset", "delete"];
let currentSelection = '';


getCount();

const toggle = async () => {
    let response = await fetch('/togglebreak').then(response => response.text());
    pause.setAttribute('style', `color: ${response == 'true' ? '#00ff00' : '#ff0000'}`);
}
async function getCount() {
    let response = await fetch(`/count`).then(res => res.json());
    let rowProducts = document.createElement("div");
    rowProducts.setAttribute("id", "Products");
    rowProducts.setAttribute("class", "row")
    admin.appendChild(rowProducts);
    products = document.getElementById("Products");
    response.forEach(product => {
        let column = document.createElement("div")
        column.setAttribute("id", product.name)
        column.setAttribute("class", "column")
        column.setAttribute("style", `width: ${100 / response.length}%`)
        products.appendChild(column);
        let text = document.createElement("p");
        text.setAttribute("id", `${product.name}title`)
        text.setAttribute("style", "font-size:50px;margin: 0;")
        text.appendChild(document.createTextNode(product.name))
        document.getElementById(product.name).appendChild(text)
        op.forEach(operation => {
            let button = document.createElement("button")
            button.setAttribute("id", `${product.name}${operation}`)
            button.setAttribute("class", "block")
            button.setAttribute("onclick", `setCount("${product.name}","${operation}")`)
            let text = document.createTextNode(`${operation.charAt(0).toUpperCase() + operation.slice(1)}`);
            button.appendChild(text);
            document.getElementById(product.name).appendChild(button);
        });
        let button = document.createElement("button");
        button.setAttribute("id", `${product.name}plan`)
        button.setAttribute("class", "block");
        button.setAttribute("onclick", `setPlan("${product.name}")`);
        button.appendChild(document.createTextNode(`Plan`))
        document.getElementById(product.name).appendChild(button);
    });
}
async function setCount(product, op) {
    if (op === "delete" || op === "add") {
        if (op === "add") await fetch(`/update?product=${document.getElementById("newProduct").value}&option=${op}`);
        if (op === "delete") await fetch(`/update?product=${product}&option=${op}`);
        add.style.visibility = "hidden";
        admin.style.visibility = "visible";
        plan.style.visibility = "hidden";
        [...document.getElementsByClassName("row")].map(n => n && n.remove());
        getCount();
    }
    else {
        fetch(`/edit?product=${product}&op=${op}`)
    }
}
async function checkPass() {
    let response = await fetch(`/password?password=${document.getElementById("password").value}`).then(response => response.text());
    let correct = response == 'true'
    if (correct) {
        login.style.visibility = "hidden";
        admin.style.visibility = "visible";
        plan.style.visibility = "hidden";
    }
    else alert("Wrong password");
}
function enterKeyPressed(event) {
    if (event.keyCode == 13) {
        if (login.style.visibility !== "hidden") {
            checkPass();
        }
        if (add.style.visibility !== "hidden") {
            setCount(null,"add");
        }
        if (plan.style.visibility !== "hidden") {
            sendPlan(currentSelection);
        }
    }
       
}
function addProduct() {
    admin.style.visibility = "hidden";
    plan.style.visibility = "hidden";
    add.style.visibility = "visible";
}
function setPlan(productName) {
    admin.style.visibility = "hidden";
    plan.style.visibility = "visible";
    add.style.visibility = "hidden";
    currentSelection = `${productName}`;
    planBtn.setAttribute("onclick", `sendPlan("${productName}")`);
}
async function sendPlan(product) {
    fetch(`/plan?product=${product}&plan=${document.getElementById("planProduct").value}`);
    admin.style.visibility = "visible";
    plan.style.visibility = "hidden";
    add.style.visibility = "hidden";
}
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (let i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}