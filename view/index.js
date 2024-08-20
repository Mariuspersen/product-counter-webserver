const products = document.getElementById("products");
const css = document.querySelector(':root');

setInterval( async () => {
    const products_json = await fetch('/count').then(response => response.json());
    css.style.setProperty('--products', products_json.length+1);
    products_json.forEach(product => {
        const product_element = document.getElementById(product.name);
        
        if(product_element) {
            product_element.innerHTML = `${product.name}: ${product.count}/${product.plan}`;
            return;
        }
        let p = document.createElement('p');
        p.setAttribute("id",product.name)
        p.innerHTML = `${product.name}: ${product.count}/${product.plan}`;
        products.appendChild(p);
    });
    if(products.children.length != products_json.length) {
        location.reload();
    }
},1000)
