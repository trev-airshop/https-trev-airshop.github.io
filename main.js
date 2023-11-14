import { createInput, resetForm } from './formUtils.js';
import { updateTable, addDeleteButtonToRow } from './tableUtils.js';
import ProductManager from './productManager.js';
import { downloadCSV } from './csvUtils.js';

document.addEventListener("DOMContentLoaded", function () {
  const getElement = (id) => document.getElementById(id);
  const colorVariantsContainer = getElement("colorInputs");
  const addColorVariantButton = getElement("addColorVariant");
  const sizeVariantsContainer = getElement("sizeInputs");
  const addSizeVariantButton = getElement("addSizeVariant");
  const submissionTable = getElement("submissionTable");
  const submissionBody = getElement("submissionBody");

  const productManager = new ProductManager(updateTable, submissionBody);

  addColorVariantButton.addEventListener("click", function () {
    const colorInput = createInput("text", "color", "Color");
    colorVariantsContainer.appendChild(colorInput);
  });

  addSizeVariantButton.addEventListener("click", function () {
    // ... Similar logic for size variants
  });

  getElement("generateSKUs").addEventListener("click", function () {
    productManager.generateSKUs();
  });

  getElement("submitProduct").addEventListener("click", function () {
    // Logic to gather data from form and call productManager.addProduct()
  });

  getElement("downloadCSV").addEventListener("click", function () {
    downloadCSV(productManager.products);
  });

  // ... other event listeners
});
