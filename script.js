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

  // PapaParse code to parse the CSV file
    let typeToDetailsMap = {};

    Papa.parse('https://raw.githubusercontent.com/trev-airshop/https-trev-airshop.github.io/main/merchtypes.csv?token=GHSAT0AAAAAACKIJ7RCNELJD4JTAS5SNNEQZKS4YDA', {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(row => {
                const type = row['Type'];
                const category = row['Category'];
                const tags = row['tags'];
                typeToDetailsMap[type] = { category, tags };
            });

           console.log("Type to Details Map:", typeToDetailsMap);
        }
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

let skuCounter = {};
let fullSizeRankings = {};
let productColorSkuNumber = {};

// Event listener for the "Generate SKUs" button
getElement("generateSKUs").addEventListener("click", function () {
    // Reset the related objects for a new batch of products
    skuCounter = {};
    fullSizeRankings = {};
    productColorSkuNumber = {};

    // Iterate over each product in the products array
    for (let i = 0; i < products.length; i++) {
        // Generate SKU for each product, passing the entire products array
        const sku = generateSku(products[i], products);
        // Add SKU to the product
        products[i]["sku"] = sku;
    }

    // Update the table to show new SKUs
    updateTable();
});

// Function to generate SKU
function generateSku(product, products) {
    const vendor = product.vendor.replace(/[\s\uFEFF\xA0]+/g, '').toUpperCase();
    const productName = product.productName;
    const color = product.color;
    const isFullSize = product.size !== "premium" && product.price > 0;

    // Initialize vendor in skuCounter if not present
    if (!skuCounter[vendor]) {
        skuCounter[vendor] = 0; // Start with 0 for each new vendor
    }

    // Ensure productColorSkuNumber is properly initialized for the productName
    if (!productColorSkuNumber[productName]) {
        productColorSkuNumber[productName] = {};
    }

    // Ensure color is initialized for the productName
    if (productColorSkuNumber[productName][color] === undefined) {
        // Increment SKU number for a new color variant or new product
        skuCounter[vendor]++;
        productColorSkuNumber[productName][color] = skuCounter[vendor];
    }

    let skuNumber = productColorSkuNumber[productName][color];
  
    let fSnippet = '';

    // Generate ranking for full-size products and add F snippet
    if (isFullSize) {
        if (!fullSizeRankings[productName]) {
            fullSizeRankings[productName] = {};
        }
        if (!fullSizeRankings[productName][color]) {
            fullSizeRankings[productName][color] = getFullSizeRankings(products, productName, color);
        }

        const productKey = `${productName}-${product.size}-${product.price}`;
        const ranking = fullSizeRankings[productName][color][productKey];
        const numberOfFullSizeVariants = Object.keys(fullSizeRankings[productName][color]).length;

        if (ranking && numberOfFullSizeVariants > 1) {
            fSnippet = `F${ranking}-`;
        }
    }

    const skuNumberString = String(skuNumber).padStart(6, "0");

    if (product.size === "Premium Sample") {
        return `SHELF-premium-demand-${vendor}-${skuNumberString}`;
    } else if (product.size === "Free Sample") {
        return `SHELF-demand-${vendor}-${skuNumberString}`;
    } else {
        return `SHELF-${fSnippet}${vendor}-${skuNumberString}`;
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
 
  // NEW CODE START SHOPIFY CSV

  

  function downloadShopifyCSV() {
    // Headers from the Shopify template
    const headers = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags",	"Published",	"Option1 Name",	"Option1 Value",	"Option2 Name",	"Option2 Value",	"Option3 Name",	"Option3 Value",	"Variant SKU",	"Variant Grams",	"Variant Inventory Tracker",	"Variant Inventory Qty",	"Variant Inventory Policy",	"Variant Fulfillment Service",	"Variant Price",	"Variant Compare At Price",	"Variant Requires Shipping",	"Variant Taxable",	"Variant Barcode",	"Image Src",	"Image Position",	"Image Alt Text",	"Gift Card",	"SEO Title",	"SEO Description",	"Google Shopping / Google Product Category",	"Google Shopping / Gender",	"Google Shopping / Age Group",	"Google Shopping / MPN",	"Google Shopping / AdWords Grouping",	"Google Shopping / AdWords Labels",	"Google Shopping / Condition",	"Google Shopping / Custom Product",	"Google Shopping / Custom Label 0",	"Google Shopping / Custom Label 1",	"Google Shopping / Custom Label 2",	"Google Shopping / Custom Label 3",	"Google Shopping / Custom Label 4",	"Variant Image",	"Variant Weight Unit",	"Variant Tax Code",	"Cost per item",	"Price / International",	"Compare At Price / International",	"Status"]; // List all headers here

    // Hardcoded and dynamic values from the second row of the template
    const defaultValues = {
        "Handle": "", // Leave blank or add logic if needed
        "Title": (product) => product.productName,
        "Body (HTML)": "", // Leave blank or add logic if needed
        "Vendor": (product) => product.vendor,
        "Product Category": (product) => {
          console.log("Product Type:", product.productType);
          const details = typeToDetailsMap[product.productType];
          console.log("Category Details:", details);
          return details ? details.category : "";
        },
        "Type": (product) => product.productType,
        "Tags": (product) => {
          const details = typeToDetailsMap[product.productType];
          return details ? details.tags : "";
        },
        "Published": "TRUE", 
        "Option1 Name": (product) => product.color ? "Color" : "Size",
        "Option1 Value": (product) => product.color || product.size,
        "Option2 Name": (product) => product.color ? "Size" : "",
        "Option2 Value": (product) => product.color ? product.size : "",
        "Option3 Name": "",
        "Option3 Value": "",
        "Variant SKU": (product) => product.sku,
        "Variant Grams": (product) => typeof product.size === 'number' ? product.size : "",
        "Variant Inventory Tracker": "Shopify",
        "Variant Inventory Qty": "",
        "Variant Inventory Policy": "deny", 
        "Variant Fulfillment Service": "manual", 
        "Variant Price": (product) => product.price,
        "Variant Compare At Price": "",
        "Variant Requires Shipping": "TRUE", 
        "Variant Taxable": "TRUE", 
        "Variant Barcode": (product) => product.barcode,
        "Image Src": "",
        "Image Position": "",
        "Image Alt Text": "",
        "Gift Card": "",
        "SEO Title": "",
        "SEO Description": "",
        "Google Shopping / Google Product Category": "",
        "Google Shopping / Gender": "",
        "Google Shopping / Age Group": "",
        "Google Shopping / MPN": "",
        "Google Shopping / AdWords Grouping": "",
        "Google Shopping / AdWords Labels": "",
        "Google Shopping / Condition": "",
        "Google Shopping / Custom Product": "",
        "Google Shopping / Custom Label 0": "",
        "Google Shopping / Custom Label 1": "",
        "Google Shopping / Custom Label 2": "",
        "Google Shopping / Custom Label 3": "",
        "Google Shopping / Custom Label 4": "",
        "Variant Image": "",
        "Variant Weight Unit": "",
        "Variant Tax Code": "",
        "Cost per item": (product) => product.cost,
        "Price / International": "",
        "Compare At Price / International": "",
        "Status": "Draft",
        
    };

    // Convert products to CSV
    let csvContent = headers.join(",") + "\n";

products.forEach(product => {
    let row = headers.map(header => {
        // Check if the default value is a function and call it with 'product'
        if (typeof defaultValues[header] === "function") {
            return defaultValues[header](product);
        }
        // Otherwise, use the hardcoded value or the value from the product
        return defaultValues[header] || product[header] || "";
    });
    
        csvContent += row.join(",") + "\n";
    });

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Shopify_Products.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add the event listener to your button
document.getElementById("downloadShopifyCSV").addEventListener("click", downloadShopifyCSV);


  // NEW CODE SHOPIFY CSV END


});
