export function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const csvRows = data.map(row => headers.map(header => row[header]).join(','));
  return [headers.join(','), ...csvRows].join('\n');
}

export function downloadCSV(data) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "products.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
