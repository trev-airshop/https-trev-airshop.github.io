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

  getElement("generateSKUs").addEventListener("click", function () {
    skuCounter = {};
    fullSizeRankings = {};
    productColorSkuNumber = {};

    for (let i = 0; i < products.length; i++) {
      const sku = generateSku(products[i], products);
      products[i]["sku"] = sku;
    }

    updateTable();
  });

  function generateSku(product, products) {
    const vendor = product.vendor.replace(/[\s\uFEFF\xA0]+/g, '').toUpperCase();
    const productName = product.productName;
    const color = product.color;
    const isFullSize = product.size !== "Premium Sample" && product.price > 0;

    if (!skuCounter[vendor]) {
      skuCounter[vendor] = 0;
    }

    if (!productColorSkuNumber[productName]) {
      productColorSkuNumber[productName] = {};
    }

    if (productColorSkuNumber[productName][color] === undefined) {
      skuCounter[vendor]++;
      productColorSkuNumber[productName][color] = skuCounter[vendor];
    }

    let skuNumber = productColorSkuNumber[productName][color];
    let fSnippet = '';

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

    const fullSizeProducts = products.filter(p =>
      p.productName === productName &&
      p.color === color && 
      p.size !== "Premium Sample" && p.size !== "Free Sample" &&
      p.price > 0
    );

    console.log(`Filtered full-size products:`, fullSizeProducts);

    fullSizeProducts.sort((a, b) => b.price - a.price);

    const rankings = {};
    fullSizeProducts.forEach((product, index) => {
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

    let validSubmission = true;
    let errorMessage = "";

    for (let i = 0; i < (colorInputs.length || 1); i++) {
      for (let j = 0; j < sizeInputs.length; j++) {
        const size = sizeInputs[j].value || "";
        const cost = parseFloat(costInputs[j].value) || 0;
        let price;

        if (size === 'Premium Sample') {
          price = cost * 2;
        } else {
          price = parseFloat(priceInputs[j].value) || 0;
        }

        if (size !== "Premium Sample" && size !== "Free Sample" && price < cost) {
          validSubmission = false;
          errorMessage = `Price for full-size item cannot be less than the cost. Error in size: ${size}, price: ${price}, cost: ${cost}`;
          break;
        }

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

      if (!validSubmission) {
        break;
      }
    }

    if (validSubmission) {
      resetForm();
      updateTable();
    } else {
      alert(errorMessage);
    }
  });

  function createInput(type, name, placeholder) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    return input;
  }

  function resetForm() {
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

      Object.keys(product).forEach((key) => {
        const cell = document.createElement("td");
        cell.contentEditable = "true";
        cell.innerText = product[key] || "";

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

  const addBlankRowButton = document.getElementById("addBlankRowButton");
  addBlankRowButton.addEventListener("click", function() {
    event.preventDefault();
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

    products.push(blankProduct);

    const row = document.createElement("tr");
    Object.keys(blankProduct).forEach((key) => {
      const cell = document.createElement("td");
      cell.contentEditable = "true";
      cell.innerText = "";

      cell.addEventListener("input", function() {
        blankProduct[key] = cell.innerText;
      });

      row.appendChild(cell);
    });

    addDeleteButtonToRow(row, products.length - 1);
    submissionBody.appendChild(row);
  });

  // NEW CODE START SHOPIFY CSV

  function downloadShopifyCSV() {
    const headers = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags",	"Published",	"Option1 Name",	"Option1 Value",	"Option2 Name",	"Option2 Value",	"Option3 Name",	"Option3 Value",	"Variant SKU",	"Variant Grams",	"Variant Inventory Tracker",	"Variant Inventory Qty",	"Variant Inventory Policy",	"Variant Fulfillment Service",	"Variant Price",	"Variant Compare At Price",	"Variant Requires Shipping",	"Variant Taxable",	"Variant Barcode",	"Image Src",	"Image Position",	"Image Alt Text",	"Gift Card",	"SEO Title",	"SEO Description",	"Google Shopping / Google Product Category",	"Google Shopping / Gender",	"Google Shopping / Age Group",	"Google Shopping / MPN",	"Google Shopping / AdWords Grouping",	"Google Shopping / AdWords Labels",	"Google Shopping / Condition",	"Google Shopping / Custom Product",	"Google Shopping / Custom Label 0",	"Google Shopping / Custom Label 1",	"Google Shopping / Custom Label 2",	"Google Shopping / Custom Label 3",	"Google Shopping / Custom Label 4",	"Variant Image",	"Variant Weight Unit",	"Variant Tax Code",	"Cost per item",	"Price / International",	"Compare At Price / International",	"Status"];

    const defaultValues = {
      "Handle": "",
      "Title": (product) => product.productName,
      "Body (HTML)": "",
      "Vendor": (product) => product.vendor,
      "Product Category": "",
      "Type": (product) => product.productType,
      "Tags": (product) => {
        const details = typeToDetailsMap[product.productType];
        let tags = details ? details.tags : "";

        // Add "premium" tag for Premium Sample
        if (product.size === "Premium Sample") {
          const deluxe = "premium";
          tags = tags ? `${tags}, ${deluxe}` : deluxe;
        }

        // Add "travel_size" tag if the title contains "mini"
        if (product.productName.toLowerCase().includes("mini")) {
          const travelSize = "travel_size";
          tags = tags ? `${tags}, ${travelSize}` : travelSize;
        }

        return `"${tags}"`;
      },
      "Published": "TRUE",
      "Option1 Name": (product) => product.color ? product.productName + " " + "Color" : "Size",
      "Option1 Value": (product) => product.color ? product.color : product.size > 0 ? product.size + ' mL' : product.size,
      "Option2 Name": (product) => product.color ? "Size" : "",
      "Option2 Value": (product) => product.color ? product.size > 0 ? product.size + ' mL' : product.size : "",
      "Option3 Name": "",
      "Option3 Value": "",
      "Variant SKU": (product) => product.sku,
      "Variant Grams": (product) => typeof product.size === 'number' ? product.size : "",
      "Variant Inventory Tracker": "Shopify",
      "Variant Inventory Qty": "",
      "Variant Inventory Policy": "deny",
      "Variant Fulfillment Service": "manual",
      "Variant Price": (product) => product.price,
      "Variant Compare At Price": (product) => product.size === "Premium Sample" ? product.price * 2 : null,
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

    let csvContent = headers.join(",") + "\n";

    products.forEach(product => {
      let row = headers.map(header => {
        if (typeof defaultValues[header] === "function") {
          return defaultValues[header](product);
        }
        return defaultValues[header] || product[header] || "";
      });

      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const formattedVendor = products[0].vendor.replace(/[\s\uFEFF\xA0]+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    link.download = `${formattedVendor}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.getElementById("downloadShopifyCSV").addEventListener("click", downloadShopifyCSV);

  // NEW CODE SHOPIFY CSV END

});
