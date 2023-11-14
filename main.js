import { createInput, resetForm } from './formUtils.js';
import ProductManager from './productManager.js';
import { downloadCSV } from './csvUtils.js';

document.addEventListener("DOMContentLoaded", function () {
  const getElement = (id) => document.getElementById(id);
  const colorVariantsContainer = getElement("colorInputs");
  const addColorVariantButton = getElement("addColorVariant");
  const sizeVariantsContainer = getElement("sizeInputs");
  const addSizeVariantButton = getElement("addSizeVariant");
  const submissionBody = getElement("submissionBody");

  const productManager = new ProductManager(submissionBody);

  addColorVariantButton.addEventListener("click", () => {
    const colorInput = createInput("text", "color", "Color");
    colorVariantsContainer.appendChild(colorInput);
  });

  addSizeVariantButton.addEventListener("click", () => {
    const sizeInput = createInput("text", "size", "Size Variant");
    const priceInput = createInput("text", "price", "Price");
    const costInput = createInput("text", "cost", "Cost");
    const barcodeInput = createInput("text", "barcode", "Barcode");

    [sizeInput, priceInput, costInput, barcodeInput].forEach(input => {
      sizeVariantsContainer.appendChild(input);
    });
  });

  getElement("submitProduct").addEventListener("click", () => {
    const vendor = getElement("vendor").value;
    const product = getElement("product").value;
    const productType = getElement("productType").value; 
    const colorInputs = Array.from(document.getElementsByName("color"));
    const sizeInputs = Array.from(document.getElementsByName("size"));
    const priceInputs = Array.from(document.getElementsByName("price"));
    const costInputs = Array.from(document.getElementsByName("cost"));
    const barcodeInputs = Array.from(document.getElementsByName("barcode"));

    colorInputs.forEach((colorInput, i) => {
      sizeInputs.forEach((sizeInput, j) => {
        const productData = {
          vendor,
          product,
          productType,
          color: colorInput.value,
          size: sizeInput.value,
          price: priceInputs[j].value,
          cost: costInputs[j].value,
          barcode: barcodeInputs[j].value
        };
        productManager.addProduct(productData);
      });
    });

    resetForm();
  });

  getElement("downloadCSV").addEventListener("click", () => {
    downloadCSV(productManager.getProducts());
  });
});
