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

getElement("generateSKUs").addEventListener("click", function () {
  // Reset the SKU counter and related objects
  skuCounter = {};
  fullSizeRankings = {}; 
  productColorSkuNumber = {}; // Also reset the product color SKU number

  // Iterate over each product in the products array
  for (let i = 0; i < products.length; i++) {
    // Generate SKU for the product, passing the entire products array
    const sku = generateSku(products[i], products);
    // Add SKU to the product
    products[i]["sku"] = sku;
  }

  // Update the table to show new SKUs
  updateTable();
});

function generateSku(product, products) {
  const productName = product.productName;
  const color = product.color;
  const isFullSize = product.size !== "premium" && product.price > 0;

  // Initialize product name in skuCounter if not present
  if (!skuCounter[productName]) {
    skuCounter[productName] = 1;
  }

  // Initialize color in fullSizeRankings and productColorSkuNumber for the product if not present
  if (!fullSizeRankings[productName]) {
    fullSizeRankings[productName] = {};
    productColorSkuNumber[productName] = {};
  }

  // Assign or retrieve SKU number for the color of the product
  if (!productColorSkuNumber[productName][color]) {
    productColorSkuNumber[productName][color] = skuCounter[productName];
    skuCounter[productName]++; // Increment for a new color variant of the product
  }

  let skuNumber = productColorSkuNumber[productName][color];
  let fSnippet = '';

  // Generate ranking for full-size products and add F snippet
  if (isFullSize) {
    if (!fullSizeRankings[productName][color]) {
      fullSizeRankings[productName][color] = getFullSizeRankings(products, productName, color);
    }
    // Create a unique key for the product variant
    const productKey = `${product.productName}-${product.size}-${product.price}`;
    const ranking = fullSizeRankings[productName][color][productKey];

    // Determine the number of full-size variants for this product and color
    const numberOfFullSizeVariants = Object.keys(fullSizeRankings[productName][color]).length;

    if (ranking && numberOfFullSizeVariants > 1) { // Add F snippet if more than one full-size variant
      fSnippet = `F${ranking}-`;
    }
  }

  const skuNumberString = String(skuNumber).padStart(6, "0");

  if (product.size === "premium") {
    return `SHELF-premium-demand-${productName}-${skuNumberString}`;
  } else if (product.price === 0 && product.size === "Free Sample") {
    return `SHELF-demand-${productName}-${skuNumberString}`;
  } else {
    return `SHELF-${fSnippet}${productName}-${skuNumberString}`;
  }
}

function getFullSizeRankings(products, productName, color) {
  console.log(`Calculating rankings for ${productName} - ${color}`);

  // Filter products to get only full-size variants of the specified product and color
  const fullSizeProducts = products.filter(p => 
    p.productName === productName &&
    p.color === color && 
    p.size !== "premium" && p.size !== "Free Sample" &&
    p.price > 0
  );

  console.log(`Filtered full-size products:`, fullSizeProducts);

  // Sort these products by price in descending order
  fullSizeProducts.sort((a, b) => b.price - a.price);

  // Assign rankings based on sorted order
  const rankings = {};
  fullSizeProducts.forEach((product, index) => {
    // Create a unique key for each product variant if needed
    const productKey = `${product.productName}-${product.size}-${product.price}`;
    rankings[productKey] = index + 1;

    console.log(`Ranking for ${productKey}: ${rankings[productKey]}`);
  });

  return rankings;
}



 
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
