document.addEventListener("DOMContentLoaded", function () {
  const getElement = (id) => document.getElementById(id);
  const colorVariantsContainer = getElement("colorInputs");
  const addColorVariantButton = getElement("addColorVariant");
  const sizeVariantsContainer = getElement("sizeInputs");
  const addSizeVariantButton = getElement("addSizeVariant");
  const submissionTable = getElement("submissionTable");
  const submissionBody = getElement("submissionBody");
  const products = []; // Array to store product data
  let skuCounter = 1; // Initialize SKU counter

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
    // Gather data and create product object
    const vendor = getElement("vendor").value;
    const productName = getElement("product").value;
    const colorInputs = Array.from(document.getElementsByName("color"));
    const sizeInputs = Array.from(document.getElementsByName("size"));
    const priceInputs = Array.from(document.getElementsByName("price"));
    const costInputs = Array.from(document.getElementsByName("cost"));
    const gramsInputs = Array.from(document.getElementsByName("grams"));

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

  getElement("generateSKUs").addEventListener("click", function () {
    generateSKUs();
    updateTable();
  });

  function resetForm() {
    // Clear the form fields
    getElement("vendor").value = "";
    getElement("product").value = "";
    colorVariantsContainer.innerHTML = "";
    sizeVariantsContainer.innerHTML = "";
  }

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
        <td>${product.sku || ''}</td>
      `;
      submissionBody.appendChild(row);
    });
  }

  function generateSKUs() {
    products.forEach(product => {
      if (product.price > 0 && product.size !== "premium") {
        product.sku = `SHELF-${product.vendor}-${String(skuCounter).padStart(6, '0')}`;
        skuCounter++;
      } else if (product.size === "premium") {
        product.sku = `SHELF-demand-premium-${product.vendor}-${String(skuCounter - 1).padStart(6, '0')}`;
      } else {
        product.sku = `SHELF-demand-${product.vendor}-${String(skuCounter - 1).padStart(6, '0')}`;
      }
    });
  }

  function createInput(type, name, placeholder) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    return input;
  }
});

