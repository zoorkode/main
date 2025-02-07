document.addEventListener("DOMContentLoaded", function () {
  fetchCategories();
});

function fetchCategories() {
  const url = `https://openapi.bukaolshop.net/v1/app/kategori?token=${tokenapi}`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      displayCategories(data.data); 
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

function displayCategories(categories) {
  var categoryContainer = document.getElementById("category-container");
  categories.forEach(function (categoryData) {
    if (kategoriShow.includes(categoryData.nama_kategori)) {
      var categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category");
      var categoryName = document.createElement("h3");
      categoryName.textContent = categoryData.nama_kategori;
      categoryName.addEventListener("click", function () {
        toggleSubcategories(categoryDiv);
      });
      categoryDiv.appendChild(categoryName);
      var subCategories = categoryData.sub_kategori;
      if (subCategories.length > 0) {
        var tabContainer = document.createElement("div");
        tabContainer.classList.add("tab-container");
        var tabIndicator = document.createElement("div");
        tabIndicator.classList.add("tab-indicator");
        tabContainer.appendChild(tabIndicator);
        subCategories.forEach(function (subCategoryData, index) {
          var tabButton = document.createElement("button");
          tabButton.classList.add("tab-button");
          tabButton.textContent = tabNames[index] || subCategoryData.nama_kategori;  
          tabButton.addEventListener("click", function () {
            fetchProducts(subCategoryData.id_kategori);
            highlightTabButton(tabButton);
            updateTabIndicator(tabButton, tabIndicator);
          });
          tabContainer.appendChild(tabButton);

          if (index === 0) {
            fetchProducts(subCategoryData.id_kategori);
            tabButton.classList.add("active");
            setTimeout(function () {
              updateTabIndicator(tabButton, tabIndicator);
            }, 10);
          }
        });

        categoryDiv.appendChild(tabContainer);
      } else {
        var alertMsg = document.createElement("p");
        alertMsg.textContent = "Belum Tersedia";
        categoryDiv.appendChild(alertMsg);
      }

      categoryContainer.appendChild(categoryDiv);
    }
  });

  window.addEventListener("resize", function () {
    const activeTabButton = document.querySelector(".tab-button.active");
    if (activeTabButton) {
      const tabIndicator = document.querySelector(".tab-indicator");
      updateTabIndicator(activeTabButton, tabIndicator);
    }
  });
}

function updateTabIndicator(tabButton, tabIndicator) {
  tabButton.offsetWidth; 
  const buttonWidth = tabButton.offsetWidth;
  const buttonLeft = tabButton.offsetLeft;
  tabIndicator.style.width = buttonWidth + "px";
  tabIndicator.style.left = buttonLeft + "px";
}




function toggleSubcategories(categoryDiv) {
  var tabContainer = categoryDiv.querySelector(".tab-container");
  if (tabContainer.style.display === "none") {
    tabContainer.style.display = "block";
  } else {
    tabContainer.style.display = "none";
  }
}



function highlightTabButton(activeButton) {
  var tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(function (button) {
    button.classList.remove("active");
  });
  activeButton.classList.add("active");
}

function fetchProducts(id_kategori) {
  var limit = "100";
  var apiUrl = "https://openapi.bukaolshop.net/v1/app/produk?token=" + tokenapi + "&total_data=" + limit + "&id_kategori=" + id_kategori;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(productsData => {
      resetProductContainer();
      if (productsData.data.length === 0) {
        document.getElementById('loading-overlay').style.display = 'none';
      }
      displayProducts(productsData.data);
      sortProductsByPrice('asc');
    })
    .catch(error => {
      console.error("There was a problem with the fetch operation:", error);
    });
}



function resetProductContainer() {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "Belum ada produk";
}



function displayProducts(products) {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";
  products.forEach(function (product) {
    const deskripsi = encodeURIComponent(product.deskripsi_panjang);
    let hargaFormatted = formatRupiah(product.harga_produk);
    let hargaDiskon = product.harga_produk_asli !== 0 ? formatRupiah(product.harga_produk_asli) : "";
    let hargaResellerFormatted = "";
    const membership = "reseller";
    if (membership === "reseller") {
      const hargaReseller = product.harga_produk - 100;
      hargaResellerFormatted = formatRupiah(hargaReseller);
    }
    const stokText = product.stok <= 0 ? "GANGGUAN" : product.stok;
    const listItem = document.createElement("div");
    listItem.classList.add("box", "product", "animate__animated", "animate__flipInX");
    listItem.setAttribute("data-product-name", product.nama_produk);
    listItem.setAttribute("data-product-price", hargaFormatted);
    listItem.setAttribute("data-product-description", deskripsi);
    listItem.setAttribute("data-product-url", product.url_produk);
    
    let ribbonHTML = "";
    if (product.stok <= 1) {
      ribbonHTML = `<div class="ribbon"><span>${stokText}</span></div>`;
    }

    let hargaAsliFormatted = "";
    if (product.harga_produk_asli !== 0) {
      hargaAsliFormatted = formatRupiah(product.harga_produk_asli);
    }
    let isDisabled = product.stok <= 0 ? 'disabled' : '';
    let clickEvent = isDisabled ? '' : `onclick="showProductDetails('${product.nama_produk}', '${deskripsi}', ${product.harga_produk}, '${product.url_produk}');cekNick()"`;

    listItem.innerHTML = `
      <div class="pil-produk" ${clickEvent} style="${isDisabled ? 'pointer-events: none; opacity: 0.5;' : ''}">
        <div class="d-flex">
          <img src="${product.url_gambar_produk}" alt="Product Icon" class="icon--produk img-produk">
          <div class="tag-produk">
            <h4 class="nama--produk w-100">${product.nama_produk}</h4>
            <div class="d-flex" style="justify-content:end;gap:10px;">
              <s>${hargaAsliFormatted}</s>
              <p>${hargaFormatted}</p>
            </div>
          </div>
          <div>
            ${ribbonHTML}
          </div>
        </div>
      </div>
    `;

    productContainer.appendChild(listItem);
  });
}

function cekNick() {
    var id = $('#id').val();
    if (id === "") {
     $('#nick').text('');
     $('#nickplayer').text('');
    }
    $.ajax({
     method: "GET",
     url: "https://payday.my.id/trueid/game/" + games + "/?id=" + id + "&key=KoboStore",
         beforeSend: function () {
     $('#nick').html('<i class="fas fa-spinner"></i> Mengecek...');
     $('#theend').show()
    },
    success: function (response) {
     if (response.hasOwnProperty('error_msg')) {
      $('#nick').text('Tidak Ditemukan!');
      $('#theend').hide()
     } else {
      $('#nick').text(response.nickname);
      $('#theend').show()
     }
    }
   });
}



function showProductDetails(namaProduk, deskripsi, harga, urlProduk) {
  var namaProdukElement = document.getElementById("detail_nama_produk");
  var deskripsiElement = document.getElementById("detail_deskripsi");
  var hargaElement = document.getElementById("detail_harga_produk");
  var idValueElement = document.getElementById("id_value");
  idValueElement.textContent = document.getElementById("id").value;
  namaProdukElement.textContent = namaProduk;
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = decodeURIComponent(deskripsi);
  var deskripsiContent = tempDiv.innerHTML;
  var urlRegex = /https?:\/\/[^\s]+/g;
  var matches = deskripsiContent.match(urlRegex);
  if (matches) {
    matches.forEach(function(url) {
      var linkButton = `<a href="${url}?bukaolshop_open_browser=true" target="_blank" class="btn btn-link">Cek Selengkapnya</a>`;
      deskripsiContent = deskripsiContent.replace(url, linkButton);
    });
  }
  deskripsiElement.innerHTML = deskripsiContent;
  hargaElement.textContent = formatRupiah(harga);
  var beliButton = document.querySelector(".beliBtn");
  var beliButtonClone = beliButton.cloneNode(true);
  beliButton.parentNode.replaceChild(beliButtonClone, beliButton);
  beliButtonClone.addEventListener("click", function () {
    var id = document.getElementById("id").value;
    if (id.trim() === "") {
      showNotification("Nomor Tujuan Kosong!");
    } else {
      window.location.href = urlProduk + "?catatan=" + id;
    }
  });
  document.getElementById("offcanvasBottom").classList.add("show");
  document.getElementById("offcanvasOverlay").classList.add("show");
}


function hideOffcanvas() {
  document.getElementById("offcanvasBottom").classList.remove("show");
  document.getElementById("offcanvasOverlay").classList.remove("show");
}

document.getElementById("offcanvasOverlay").addEventListener("click", hideOffcanvas);
function showNotification(message) {
  var notification = document.getElementById("notification");
  var notificationMessage = document.getElementById("notification-message");
  notificationMessage.textContent = message;
  notification.style.display = "block";
  setTimeout(function() {
    notification.style.display = "none";
  }, 2000);
}



let currentSortOrder = 'asc'; 
function sortProductsByPrice(order) {
  const productList = document.querySelectorAll('.product');
  const sortedProducts = Array.from(productList).sort((a, b) => {
    const priceA = parseFloat(a.getAttribute('data-product-price').replace('Rp', '').replaceAll('.', '').replaceAll(',', '')); 
    const priceB = parseFloat(b.getAttribute('data-product-price').replace('Rp', '').replaceAll('.', '').replaceAll(',', '')); 
    if (order === 'asc') {
      return priceA - priceB;
    } else {
      return priceB - priceA;
    }
  });

  const productContainer = document.getElementById('product-container');
  productContainer.innerHTML = '';
  sortedProducts.forEach(product => productContainer.appendChild(product));
}


function toggleSort() {
  if (currentSortOrder === 'asc') {
    currentSortOrder = 'desc'; 
    document.getElementById('sortIcon').src = shortLow; 
  } else {
    currentSortOrder = 'asc'; 
    document.getElementById('sortIcon').src = shortHight; 
  }
  sortProductsByPrice(currentSortOrder);
}




let areProductsVisible = true; 
window.onload = () => {
  const storedVisibility = localStorage.getItem('areProductsVisible');
  if (storedVisibility !== null) {
    areProductsVisible = storedVisibility === 'true'; 
  }
  updateVisibility();
};

function toggleVisibility() {
  areProductsVisible = !areProductsVisible;
  localStorage.setItem('areProductsVisible', areProductsVisible); 
  updateVisibility();
}

function updateVisibility() {
  const imgProdukElements = document.querySelectorAll('.img-produk');
  const visibilityIcon = document.getElementById('visibilityIcon');

  imgProdukElements.forEach(element => {
    if (areProductsVisible) {
      element.style.display = 'block'; 
    } else {
      element.style.display = 'none'; 
    }
  });

  if (areProductsVisible) {
    visibilityIcon.src = imgOn; 
  } else {
    visibilityIcon.src = imgOf;
  }
}




function formatRupiah(price) {
      return "Rp" + price.toLocaleString("id-ID");
}
window.onscroll = function () { scrollFunction() };
function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
      } else {
        document.getElementById("myBtn").style.display = "none";
      }
    }



function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

    $('#id').on('change', function () {
      var no = $(this).val()
      var newno = no.replace('-', '').trim()
      var cek = newno.substring(0, 3).replace('-', '').trim()
      var ceka = newno.substring(3, 16).replace('-', '').trim()
      if (cek == '+62') {
        let result = 0
        $(this).val(result + ceka)
        getNmr(result + ceka)
      } else {
        $(this).val(cek + ceka)
        getNmr(cek + ceka);
      }
    });
