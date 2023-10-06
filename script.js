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
  });

  getElement("submitProduct").addEventListener("click", function () {
    const vendor = getElement("vendor").value;
    const productName = getElement("product").value;
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

  // Add the event listener for the new Generate SKUs button
  getElement("generateSKUs").addEventListener("click", function () {
    generateSKUs(products);
    updateTable(); // Update the table to include generated SKUs
  });

  // Function to generate SKUs
  function generateSKUs(products) {
    let skuNumber = 1; // Initialize the SKU number
    products.forEach(product => {
      let prefix = 'SHELF-';
      let skuType;
      
      if (product.price > 0 && product.size !== "premium") {
        skuType = `${product.vendor}-` + skuNumber.toString().padStart(6, '0');
      } else if (product.size === "premium") {
        skuType = `demand-premium—${product.vendor}-` + skuNumber.toString().padStart(6, '0');
      } else {
        skuType = `demand-${product.vendor}-` + skuNumber.toString().padStart(6, '0');
      }

      const sku = prefix + skuType;
      product.sku = sku;
    });
  }

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

  // Function to update the table
function updateTable() {
    submissionBody.innerHTML = "";
    products.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.vendor}</td>
        <td>${product.productName}</td>
        <td>${product.color}</td>
        <td>${product.size}</td>
        <td>${product.price}</td>
        <td>${product.cost}</td>
        <td>${product.grams}</td>
        <td>${product.sku || "N/A"}</td>
      `;
      submissionBody.appendChild(row);
    });
    submissionTable.style.display = "block";
  }
