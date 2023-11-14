document.addEventListener('DOMContentLoaded', function() {
    fetch('https://raw.githubusercontent.com/trev-airshop/https-trev-airshop.github.io/main/merchtypes.csv?token=GHSAT0AAAAAACKIJ7RCNELJD4JTAS5SNNEQZKS4YDA')
        .then(response => response.text())
        .then(data => {
            var allData = parseCSV(data);
            populateSelectBox(allData.map(item => item.firstColumn));
            // You can store allData in a global variable for later use
            window.allCSVData = allData;
        });
});

function parseCSV(csvData) {
    var lines = csvData.split("\n");
    var result = [];
    lines.forEach(function(line) {
        var columns = line.split(",").map(column => column.trim());
        if (columns.length > 1) {
            result.push({
                firstColumn: columns[0],
                // Add other columns as needed
                secondColumn: columns[1],
                thirdColumn: columns[2],
                // ...
            });
        }
    });
    return result;
}

function populateSelectBox(productTypes) {
    var selectBox = document.getElementById('productType');
    productTypes.forEach(function(type) {
        var option = document.createElement('option');
        option.value = type;
        option.text = type;
        selectBox.appendChild(option);
    });
}
