const url = "https://gist.githubusercontent.com/jhonatan89/719f8a95a8dce961597f04b3ce37f97b/raw/4b7f1ac723a14b372ba6899ce63dbd7c2679e345/products-ecommerce";
let json;
let favorites = [];
let selected = [];

/**
 * Obtiene el JSON de la url y lo guarda en la variable.
 * @param {*} url url donde estan los datos
 */
async function getJson(url) {
  let gottenInfo = await fetch(url);
  let gottenJson = await gottenInfo.json();
  json = gottenJson.items;
  addProducts(json, "content");
}

/**
 * Function for rendering a list of products for a specific DOM element.
 * @param {*} products 
 * @param {*} domElement
 */
function addProducts(products, domElement) {
  let cont = document.getElementsByClassName(domElement);
  if (domElement === "favContent") {
    renderExtraFavElements();
  }

  //Este ciclo renderiza el div del que se tiene la clase que llega por parametro.
  //Por cada producto crea un div en el cual crea otros elementos que representan las caracteristicas de los productos.
  //Si se quiere renderizar la vista de favoritos los elementos extra que tiene esta vista.
  for (let i = 0; i < products.length; i++) {
    //Obtencion de caracteristicas de productos.
    let title = products[i].title;
    let picture = products[i].picture;
    let location = products[i].location;
    let price = products[i].price.amount;
    let currency = products[i].price.currency;
    let id = products[i].id;
    let freeShipping = products[i].free_shipping;

    let div = document.createElement("div");
    div.className = "listItem";

    let img = document.createElement("img");
    img.className = "prodImg";
    img.src = picture;
    img.id = id;

    let pTitle = document.createElement("p");
    pTitle.className = "title";
    pTitle.textContent = title;

    let pPrice = document.createElement("p");
    pPrice.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      currencyDisplay: "narrowSymbol",
    }).format(price);
    pPrice.className = "price";

    let pLocation = document.createElement("p");
    pLocation.textContent = location;
    pLocation.className = "location";

    //Imagen si tiene free shipping
    if (freeShipping === true) {
      let fsElement = document.createElement("img");
      fsElement.className = "freeSh";
      fsElement.src = "/static/freeShipping.png";
      div.appendChild(fsElement);
    }

    //adicion de contenidos extra si se quiere renderizar la vista de favoritos.
    //Tambien se agregan los event listeners a cada cosa que se necesita.
    if (domElement === "favContent") {
      selected.length = 0;
      let checkBox = document.createElement("input");
      checkBox.type = "checkbox";
      checkBox.className = "select selectElement";
      checkBox.addEventListener("change", function () {
        selectedFavorites(products[i], checkBox.checked);
      });
      div.appendChild(checkBox);
      img.className = "favProdImg";
      pLocation.textContent = "";

      let verArt = document.createElement("button");
      verArt.className = "checkArt";
      verArt.textContent = "Ver articulo";
      verArt.addEventListener("click", function () {
        getDetail(products[i]);
      });
      div.appendChild(verArt);
    }

    //Append de cada uno de los elementos creados anteriormente
    div.appendChild(img);
    div.appendChild(pTitle);
    div.appendChild(pPrice);
    div.appendChild(pLocation);
    cont[0].appendChild(div);

    document.getElementById(img.id).addEventListener("click", function () {
      getDetail(products[i]);
    });
  }
}

/**
 * Funcion para obtener el detalle de un producto especifico, crea y renderiza cada elemento manipulando el DOM
 * Le pone display none a las vistas que no se estan utilizando para que el render quede bien.
 * Se agregan los elementos a la div del lado izquierdo(leftSide) y a la del lado derecho(rightSide) para poder organizar bien el contenido
 * @param {*} product producto del cual se quiere obtener el detalle
 */
function getDetail(product) {
  //Esconder otras vistas y obtener divs en donde se pone el contenido
  document.getElementsByClassName("content")[0].style.display = "none";
  document.getElementsByClassName("favContent")[0].style.display = "none";
  document.getElementsByClassName("detailPage")[0].style.display = "block";
  let leftSide = document.getElementsByClassName("leftSide");
  let detailPage = document.getElementsByClassName("detailPage");
  let rightSide = document.getElementsByClassName("rightSide");

  //Creacion de cada elemento del detalle
  let title = document.createElement("p");
  title.textContent = product.title;
  title.className = "title";

  let pic = document.createElement("img");
  pic.src = product.picture;
  pic.className = "imgD";

  let price = document.createElement("p");
  price.className = "price";
  price.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.price.currency,
    currencyDisplay: "narrowSymbol",
  }).format(product.price.amount);

  let descrption = document.createElement("p");
  descrption.className = "desc";
  descrption.textContent = product.description;

  let condSold = document.createElement("p");
  condSold.textContent =
    product.condition + " | " + product.sold_quantity + " vendidos";
  condSold.className = "cond";

  let pDesc = document.createElement("p");
  pDesc.textContent = "Descripción del Producto";
  pDesc.className = "tituloDescripcion";

  //Creacion de Breadcrumb
  let breadcrumb = "";
  for (let i = 0; i < product.categories.length; i++) {
    const element = product.categories[i];
    if (i != product.categories.length - 1) {breadcrumb += element + " > ";}
    else {breadcrumb += element;}
  }

  //Creacion de Botones
  let buyButton = document.createElement("button");
  buyButton.className = "buyButton";
  buyButton.textContent = "Comprar";
  buyButton.setAttribute("data-bs-toggle", "modal");
  buyButton.setAttribute("data-bs-target", "#staticBackdrop");

  modalInfo(title.textContent);

  let favButton = document.createElement("button");
  favButton.className = "buyButton favButton";
  favButton.textContent = "Añadir a favoritos";
  favButton.addEventListener("click", function () {
    addToFavorites(product);
  });

  let bcElement = document.createElement("p");
  bcElement.className = "breadcrumb";
  bcElement.textContent = breadcrumb;

  //Append a cada lado de la vista
  detailPage[0].insertBefore(bcElement, detailPage[0].firstChild);
  leftSide[0].appendChild(pic);
  leftSide[0].appendChild(pDesc);
  leftSide[0].appendChild(descrption);

  rightSide[0].appendChild(condSold);
  rightSide[0].appendChild(title);
  rightSide[0].appendChild(price);
  rightSide[0].appendChild(buyButton);
  rightSide[0].appendChild(favButton);
}

/**
 * Renders the extra elements needed for the favorites tab.
 */
function renderExtraFavElements() {
  let favSection = document.getElementsByClassName("favContent")[0];
  let title = document.createElement("p");
  title.textContent = "Favoritos";
  title.id = "favTitle";
  favSection.appendChild(title);

  let delDiv = document.createElement("div");
  delDiv.className = "listItem divFav";

  let button = document.createElement("button");
  button.textContent = "Eliminar";
  button.id = "deleteFav";
  button.disabled = true;
  button.addEventListener("click", function () {
    deleteSelection();
  });

  let checkBox = document.createElement("input");
  checkBox.type = "checkbox";
  checkBox.className = "select deleteAllSel";
  checkBox.addEventListener("change", function () {
    selectedAll(checkBox.checked);
  });

  delDiv.appendChild(button);
  delDiv.appendChild(checkBox);
  favSection.appendChild(delDiv);
}

/**********************************************************************************
 * ********************************************************************************
 *
 * Extra functions for managing the renders done on the functions above
 *
 * ********************************************************************************
 * ********************************************************************************
 */

/**
 * Agrega un producto a la lista de favoritos.
 * @param {*} product producto que se agrega a favoritos
 */
function addToFavorites(product) {
  if (!favorites.includes(product)) {favorites.push(product);}
}

/**
 * Filtra el json con respecto a la palabra buscada.
 */
function filterJson() {
  let word = document.getElementById("searchWord").value;
  let result = json.filter((item) => item.categories.includes(word + ""));
  if (result.length !== 0) {removeAndRender(result, "content");}
  else {
    removeAndRender(json, "content");
    showHideAlert(true);
  }
}

/**
 * renderiza la vista que se quiere, remueve todo lo de las otras vistas y las esconde.
 * @param {*} json 
 * @param {*} domElement 
 */
function removeAndRender(json, domElement) {
  let divs = [];
  divs.push(document.getElementsByClassName("content")[0]);
  divs.push(document.getElementsByClassName("favContent")[0]);

  if (divs[0].style.display !== "block" || divs[1].style.display !== "block")
  {removeDetail();}

  for (let i = 0; i < divs.length; i++) {
    const element = divs[i];
    removeChilds(element);
    if (element.className === domElement) {
      element.style.display = "block";
      addProducts(json, domElement);
    } else {
      element.style.display = "none";
    }
  }
}

/**
 * Remueve los elementos de la vista de detalle.
 */
function removeDetail() {
  document.getElementsByClassName("detailPage")[0].style.display = "none";

  if (document.getElementsByClassName("breadcrumb").length === 1)
  {document.getElementsByClassName("breadcrumb")[0].remove();}

  let detail = document.getElementsByClassName("det");
  for (let i = 0; i < detail.length; i++) {
    const element = detail[i];
    removeChilds(element);
  }
}

/**
 * Remueve los hijos de un elemento del DOM
 * @param {*} element 
 */
function removeChilds(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Muestra o esconde una arregla.
 * @param {*} bool 
 */
function showHideAlert(bool) {
  if (bool) {document.getElementsByClassName("alert")[0].style.display = "block";}
  else {document.getElementsByClassName("alert")[0].style.display = "none";}
}

/**
 * Funcion usada cuando se marca una checkBox, cambia todo lo necesario en caso de que ya no hayan seleccionadas, 
 * y en caso en que todas esten seleccionadas.
 * @param {*} product 
 * @param {*} value 
 */
function selectedFavorites(product, value) {
  if (value) {
    document.getElementById("deleteFav").style.background = "#E1677D";
    document.getElementById("deleteFav").disabled = false;
    if (!selected.includes(product)) {
      selected.push(product);
    }
    if (selected.length === favorites.length) {
      document.getElementsByClassName("deleteAllSel")[0].checked = true;
    }
  } else {
    if (selected.includes(product)) {
      selected.splice(selected.indexOf(product), 1);
    }
    if (selected.length === 0) {
      document.getElementById("deleteFav").style.background = "#ECE9E9";
      document.getElementById("deleteFav").disabled = true;
    }
  }

  if (selected.length < favorites.length) {
    document.getElementsByClassName("deleteAllSel")[0].checked = false;
  }

  //console.log(selected);
}

/**
 * Selecciona todos los productos de los favoritos.
 * @param {*} value 
 */
function selectedAll(value) {
  let checkboxes = document.getElementsByClassName("selectElement");
  if (value) {
    for (let i = 0; i < favorites.length; i++) {
      if (!selected.includes(favorites[i])) {
        selected.push(favorites[i]);
        checkboxes[i].checked = true;
      }
    }
    document.getElementById("deleteFav").style.background = "#E1677D";
    document.getElementById("deleteFav").disabled = false;
  } else {
    if (selected.length === favorites.length) {
      selected.length = 0;
      for (let i = 0; i < favorites.length; i++) {
        checkboxes[i].checked = false;
      }
      document.getElementById("deleteFav").style.background = "#ECE9E9";
      document.getElementById("deleteFav").disabled = true;
    }
  }
  //console.log(selected);
}

/**
 * Borra todos los productos seleccionados.
 */
function deleteSelection() {
  let notRemoved = [];
  for (let i = 0; i < favorites.length; i++) {
    if (!selected.includes(favorites[i])) {notRemoved.push(favorites[i]);}
  }
  selected.length = 0;
  favorites = notRemoved;
  //console.log("favs " + favorites);
  removeFav();
  addProducts(favorites, "favContent");
}

function removeFav() {
  let favs = document.getElementsByClassName("favContent")[0];
  removeChilds(favs);
}

function onModalClose() {
  removeAndRender(json, "content");
}

function modalInfo(name) {
  let modalBody = document.getElementsByClassName("modal-body")[0];
  removeChilds(modalBody);
  let p = document.createElement("p");
  p.id = "modal-Name";
  p.textContent = name;
  let p2 = document.createElement("p");
  p2.id = "modal-Text";
  p2.textContent = "Añadido al carrito de compras";
  modalBody.appendChild(p);
  modalBody.appendChild(p2);
}


getJson(url);

//Creacion de event listeners de algunas de las partes ya existentes del html.
document
  .getElementsByClassName("navFav")[0]
  .addEventListener("click", function () {
    removeAndRender(favorites, "favContent");
  });

document
  .getElementById("alertClose")
  .addEventListener("click", function (event) {
    event.preventDefault();
    showHideAlert(false);
  });

document
  .getElementById("searchBut")
  .addEventListener("click", function (event) {
    event.preventDefault();
    filterJson();
  });

document
  .getElementsByClassName("close-modal")[0]
  .addEventListener("click", function (event) {
    event.preventDefault();
    onModalClose();
  });

document
  .getElementsByClassName("logo")[0]
  .addEventListener("click", function () {
    removeAndRender(json, "content");
  });
