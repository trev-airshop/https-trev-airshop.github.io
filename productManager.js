// productManager.js
export default class ProductManager {
  constructor(updateTableCallback) {
    this.products = [];
    this.skuCounter = {};
    this.updateTable = updateTableCallback;
  }

  addProduct(productData) {
    this.products.push(productData);
    this.updateTable(this.products);
  }

  deleteProduct(index) {
    this.products.splice(index, 1);
    this.updateTable(this.products);
  }

  generateSku(product) {
    // SKU generation logic
  }

  // ... other methods
}
