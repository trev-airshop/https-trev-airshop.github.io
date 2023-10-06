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
    const gramsInput = createInput("text", "grams", "Grams");

    sizeVariantsContainer.appendChild(sizeInput);
    sizeVariantsContainer.appendChild(priceInput);
    sizeVariantsContainer.appendChild(costInput);
    sizeVariantsContainer.appendChild(gramsInput);

    // Show the "Grams" input when adding size variants
    gramsInput.style.display = "block";
  });

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
    const vendor = product.vendor;
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
      return `SHELF-demand-premium-${vendor}-${skuNumberString}`;
    } else {
      return `SHELF-demand-${vendor}-${skuNumberString}`;
    }
  }
  
  getElement("submitProduct").addEventListener("click", function () {
    const vendor = getElement("vendor").value;
    const productName = getElement("product").value;
    const productType = getElement("productType").value; 
    const colorInputs = Array.from(document.getElementsByName("color"));
    const sizeInputs = Array.from(document.getElementsByName("size"));
    const priceInputs = Array.from(document.getElementsByName("price"));
    const costInputs = Array.from(document.getElementsByName("cost"));
    const gramsInputs = Array.from(document.getElementsByName("grams"));

    // Generate rows for each variant combination
    for (let i = 0; i < (colorInputs.length || 1); i++) {
      for (let j = 0; j < sizeInputs.length; j++) {
        const size = sizeInputs[j].value || "N/A";
        const price = priceInputs[j].value || 0;
        const cost = costInputs[j].value || 0;
        const grams = gramsInputs[j].value || "N/A";

        const productData = {
          vendor: vendor,
          productName: productName,
          productType: productType,
          color: colorInputs[i]?.value || "N/A",
          size: size,
          price: price,
          cost: cost,
          grams: grams,
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
    getElement("vendor").value = "";
    getElement("product").value = "";
    getElement("productType").value = "";
    colorVariantsContainer.innerHTML = "";
    sizeVariantsContainer.innerHTML = "";
    const gramsInputs = Array.from(document.getElementsByName("grams"));
    gramsInputs.forEach((input) => {
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

    submissionBody.appendChild(row);
  });
  submissionTable.style.display = "block";
}

});






