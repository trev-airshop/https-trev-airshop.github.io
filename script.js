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

  getElement("generateSKUs").addEventListener("click", function () {
    // Reset the SKU counter
    skuCounter = {};
  
    // Iterate over each product in the products array
    for (let i = 0; i < products.length; i++) {
      // Generate SKU for the product
      const sku = generateSku(products[i]);
      // Add SKU to the product
      products[i]["sku"] = sku;
    }
  
    // Update the table to show new SKUs
    updateTable();
  });
  
  function generateSku(product) {
    const vendor = product.vendor.toUpperCase();
    let skuNumber;
    if (!skuCounter[vendor]) {
      skuCounter[vendor] = 1;
    }
  
    if (product.price > 0 && product.size !== "premium") {
      skuNumber = skuCounter[vendor];
      skuCounter[vendor]++;
    } else {
      skuNumber = skuCounter[vendor] - 1;
    }
  
    const skuNumberString = String(skuNumber).padStart(6, "0");
  
    if (product.price > 0 && product.size !== "premium") {
      return `SHELF-${vendor}-${skuNumberString}`;
    } else if (product.size === "premium") {
      return `SHELF-premium-demand-${vendor}-${skuNumberString}`;
    } else {
      return `SHELF-demand-${vendor}-${skuNumberString}`;
    }
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

    // Add event listener for the new Shopify CSV download button
    const downloadShopifyCSVButton = getElement("downloadShopifyCSV");
    downloadShopifyCSVButton.addEventListener("click", function() {
        downloadShopifyCSV(products);
    });

    // Function to download Shopify-formatted CSV
    function downloadShopifyCSV(data) {
        // Fetch the Shopify CSV template and then process data
        // Assume 'shopifyTemplate.csv' is the path to your template
        fetch('https://raw.githubusercontent.com/trev-airshop/https-trev-airshop.github.io/main/shopProductTemplate.csv?token=GHSAT0AAAAAACKIJ7RD5TZNNNK6K4UKA372ZKS7AZA')
            .then(response => response.text())
            .then(template => {
                const headers = template.split("\n")[0].split(",");
                const shopifyFormattedData = convertDataToShopifyFormat(data, headers);
                const shopifyCsv = [headers.join(","), ...shopifyFormattedData].join("\n");
                triggerCSVDownload(shopifyCsv, "shopify_products.csv");
            })
            .catch(error => {
                console.error("Error fetching Shopify template:", error);
            });
    }

    function convertDataToShopifyFormat(products, headers) {
    let shopifyFormattedData = [];

    products.forEach(product => {
        const hasColorOptions = product.colors && product.colors.length > 0;

        // If there are color options, map both color and size
        if (hasColorOptions) {
            product.colors.forEach(color => {
                product.sizes.forEach(size => {
                    let shopifyRow = createShopifyRow(product, headers, color, size, true);
                    shopifyFormattedData.push(shopifyRow);
                });
            });
        } else {
            // If no color options, only map size
            product.sizes.forEach(size => {
                let shopifyRow = createShopifyRow(product, headers, null, size, false);
                shopifyFormattedData.push(shopifyRow);
            });
        }
    });

    return shopifyFormattedData;
}

function createShopifyRow(product, headers, color, size, hasColor) {
    return headers.map(header => {
        switch (header) {
            case "Option1 Name": return hasColor ? "Color" : "Size";
            case "Option1 Value": return hasColor ? color : size;
            case "Option2 Name": return hasColor ? "Size" : "";
            case "Option2 Value": return hasColor ? size : "";
            // Add mappings for other headers...
            default: return ""; // Or some default value as per your data structure
        }
    }).join(",");
}


    function triggerCSVDownload(csvData, filename) {
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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
