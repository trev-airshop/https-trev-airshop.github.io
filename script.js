document.addEventListener("DOMContentLoaded", function () {
  const getElement = (id) => document.getElementById(id);
  const colorVariantsContainer = getElement("colorInputs");
  const addColorVariantButton = getElement("addColorVariant");
  const sizeVariantsContainer = getElement("sizeInputs");
  const addSizeVariantButton = getElement("addSizeVariant");
  const submissionTable = getElement("submissionTable");
  const submissionBody = getElement("submissionBody");
  const products = []; // Array to store product data

  addColorVariantButton.addEventListener("click", function () {
    const colorInput = createInput("text", "color", "Color");
    colorVariantsContainer.appendChild(colorInput);
  });

  addSizeVariantButton.addEventListener("click", function () {
    const sizeInput = createInput("text", "size", "Size Variant");
    const priceInput = createInput("text", "price", "Price");
    const costInput = createInput("text", "cost", "Cost");
    const barcodeInput = createInput("text", "barcode", "Barcode");

    sizeVariantsContainer.appendChild(sizeInput);
    sizeVariantsContainer.appendChild(priceInput);
    sizeVariantsContainer.appendChild(costInput);
    sizeVariantsContainer.appendChild(barcodeInput);

    // Show the "Barcode" input when adding size variants
    barcodeInput.style.display = "block";
  });

  function addDeleteButtonToRow(row, index) {
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "-";
  deleteButton.className = "delete-button";
  deleteButton.addEventListener("click", function() {
    row.remove();
    products.splice(index, 1);
    updateTable();
  });
  row.appendChild(deleteButton);
}

  let skuCounter = {
    // This object will keep track of SKU numbers for each vendor.
  };

  document.addEventListener("DOMContentLoaded", function () {
  // ... [keep all existing code up to the 'generateSKUs' event listener]

  // Updated 'generateSKUs' event listener
  getElement("generateSKUs").addEventListener("click", function () {
    // Reset the SKU counter
    skuCounter = {};

    // Call the updated SKU generation function
    updateSkus(products);

    // Update the table to show new SKUs
    updateTable();
  });

// SKU Generation Logic
function updateSkus(products) {
  // Reset SKU counter for each vendor-product-color combination
  let skuCounter = {};
  let fullSizeVariantCounter = {};

  products.forEach(product => {
    const vendor = product.vendor.toUpperCase();
    const color = product.color || '';
    const size = product.size;
    const price = parseFloat(product.price);
    const key = `${vendor}-${product.productName}-${color}`;

    // Initialize SKU counter and full-size variant array if not present
    if (!skuCounter[key]) {
      skuCounter[key] = 1;
      fullSizeVariantCounter[key] = [];
    }

    // If full-size, add to full-size variant array for later processing
    if (price > 0 && size !== 'premium') {
      fullSizeVariantCounter[key].push(product);
    }
  });

  // Process full-size variants for each vendor-product-color combination
  Object.keys(fullSizeVariantCounter).forEach(key => {
    const fullSizeVariants = fullSizeVariantCounter[key];
    if (fullSizeVariants.length <= 1) return; // Skip if only one full-size variant

    // Sort full-size variants by price in descending order
    fullSizeVariants.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    // Assign F1, F2, etc. to full-size variants
    fullSizeVariants.forEach((product, index) => {
      const skuNumber = skuCounter[key];
      product.sku = `SHELF-F${index + 1}-${key}-${String(skuNumber).padStart(6, '0')}`;
    });

    // Increment SKU counter for this combination
    skuCounter[key]++;
  });

  // Generate SKUs for non-full-size and single full-size variants
  products.forEach(product => {
    const vendor = product.vendor.toUpperCase();
    const color = product.color || '';
    const size = product.size;
    const price = parseFloat(product.price);
    const key = `${vendor}-${product.productName}-${color}`;

    if (price > 0 && size !== 'premium' && fullSizeVariantCounter[key].length <= 1) {
      // Single full-size variant
      const skuNumber = skuCounter[key];
      product.sku = `SHELF-${key}-${String(skuNumber).padStart(6, '0')}`;
    } else if (size === 'premium' || price === 0) {
      // Premium or zero-price variants
      const suffix = size === 'premium' ? 'premium-demand' : 'demand';
      const skuNumber = skuCounter[key];
      product.sku = `SHELF-${suffix}-${key}-${String(skuNumber).padStart(6, '0')}`;
    }
  });
}

// Replace your existing 'generateSKUs' event listener with this
getElement("generateSKUs").addEventListener("click", function () {
  // Reset the SKU counter
  skuCounter = {};

  // Call the updated SKU generation function
  updateSkus(products);

  // Update the table to show new SKUs
  updateTable();
});


  
  getElement("submitProduct").addEventListener("click", function () {
    const vendor = getElement("vendor").value;
    const product = getElement("product").value;
    const productName = vendor + " " + product;
    const productType = getElement("productType").value; 
    const colorInputs = Array.from(document.getElementsByName("color"));
    const sizeInputs = Array.from(document.getElementsByName("size"));
    const priceInputs = Array.from(document.getElementsByName("price"));
    const costInputs = Array.from(document.getElementsByName("cost"));
    const barcodeInputs = Array.from(document.getElementsByName("barcode"));

    // Generate rows for each variant combination
    for (let i = 0; i < (colorInputs.length || 1); i++) {
      for (let j = 0; j < sizeInputs.length; j++) {
        const size = sizeInputs[j].value || "";
        const price = priceInputs[j].value || 0;
        const cost = costInputs[j].value || 0;
        const barcode = barcodeInputs[j].value || "";

        const productData = {
          vendor: vendor,
          productName: productName,
          productType: productType,
          color: colorInputs[i]?.value || "",
          size: size,
          price: price,
          cost: cost,
          barcode: barcode,
        };
        
        products.push(productData);
      }
    }

    resetForm();
    updateTable();
  });

  getElement("downloadCSV").addEventListener("click", function () {
    downloadCSV(products);
  });

  // Function to download the CSV file
  function downloadCSV(data) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "products.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Function to convert an array of objects to CSV format
  function convertToCSV(data) {
    const header = Object.keys(data[0]).join(",");
    const csvRows = data.map((row) => Object.values(row).join(","));
    return [header, ...csvRows].join("\n");
  }

  // Function to create input elements
  function createInput(type, name, placeholder) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    return input;
  }

  // Function to reset the form
  function resetForm() {
    // getElement("vendor").value = "";
    getElement("product").value = "";
    getElement("productType").value = "";
    colorVariantsContainer.innerHTML = "";
    sizeVariantsContainer.innerHTML = "";
    const Inputs = Array.from(document.getElementsByName(""));
    Inputs.forEach((input) => {
      input.style.display = "none";
    });
  }

function updateTable() {
  submissionBody.innerHTML = "";
  products.forEach((product, index) => {
    const row = document.createElement("tr");
    
    // Create individual cells
    Object.keys(product).forEach((key) => {
      const cell = document.createElement("td");
      cell.contentEditable = "true";
      cell.innerText = product[key] || "";
      
      // Update 'products' array when the cell content changes
      cell.addEventListener("input", function() {
        products[index][key] = cell.innerText;
      });

      row.appendChild(cell);
    });

    addDeleteButtonToRow(row, index); 
    submissionBody.appendChild(row);
  });

  submissionTable.style.display = "block";
}


// Add "Add Blank Row" button
const addBlankRowButton = document.getElementById("addBlankRowButton");
addBlankRowButton.addEventListener("click", function() {
  event.preventDefault();
  // Create a blank product object with all keys but empty values
  const blankProduct = {
    vendor: "",
    productName: "",
    productType: "",
    color: "",
    size: "",
    price: "",
    cost: "",
    barcode: "",
    sku: ""
  };
  
  // Add it to the products array
  products.push(blankProduct);

  // Create a new row and populate it with editable, empty cells
  const row = document.createElement("tr");
  Object.keys(blankProduct).forEach((key) => {
    const cell = document.createElement("td");
    cell.contentEditable = "true";
    cell.innerText = "";
    
    // Update the 'products' array when the cell content changes
    cell.addEventListener("input", function() {
      blankProduct[key] = cell.innerText;
    });

    row.appendChild(cell);
  });

  addDeleteButtonToRow(row, products.length - 1);
  // Append the row to the table
  submissionBody.appendChild(row);

});

});





