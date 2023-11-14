export default class ProductManager {
  constructor(submissionBody) {
    this.products = [];
    this.submissionBody = submissionBody;
  }

  addProduct(productData) {
    this.products.push(productData);
    this.updateTable();
  }

  getProducts() {
    return this.products;
  }

  updateTable() {
    this.submissionBody.innerHTML = '';
    this.products.forEach((product, index) => {
      const row = document.createElement("tr");
      Object.entries(product).forEach(([key, value]) => {
        const cell = document.createElement("td");
        cell.innerText = value;
        row.appendChild(cell);
      });
      this.submissionBody.appendChild(row);
    });
  }
}
