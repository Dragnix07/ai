document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadForm = document.getElementById("uploadForm");

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(uploadForm);
    console.log(formData);
  });
});
    