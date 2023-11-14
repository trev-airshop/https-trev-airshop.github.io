export function createInput(type, name, placeholder) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  return input;
}

export function resetForm() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.value = '';
  });
}
