document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const dropArea = document.getElementById('dropArea');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const downloadButton = document.getElementById('downloadButton');
  const languageSelector = document.getElementById('languageSelector');

  // Hide loading and download button initially
  loading.style.display = 'none';
  downloadButton.style.display = 'none';

  // File drop functionality
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  dropArea.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  // Trigger file input when clicking on the drop area
  dropArea.addEventListener('click', () => {
    imageInput.click();
  });

  imageInput.addEventListener('change', () => {
    handleFiles(imageInput.files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    }
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(uploadForm);

    // Add the selected language to the form data
    formData.append('language', languageSelector.value);

    // Check if an image has been selected
    if (!imageInput.files.length) {
      alert('Please select an image to upload.');
      return;
    }

    loading.style.display = 'block';
    result.innerHTML = '';
    downloadButton.style.display = 'none';

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      result.innerHTML = `
        <h3>Analysis Results:</h3>
        <p><strong>Species:</strong> ${data.species}</p>
        <p><strong>Health:</strong> ${data.health}</p>
        <h4>Care Recommendations:</h4>
        <ul>
          ${data.careRecommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      `;

      downloadButton.style.display = 'block';
      downloadButton.onclick = () => {
        window.open('/download-pdf', '_blank');
      };
    } catch (error) {
      console.error('Error:', error);
      result.innerHTML = '<p class="error">An error occurred while analyzing the image. Please try again.</p>';
    } finally {
      loading.style.display = 'none';
    }
  });

  languageSelector.addEventListener('change', (e) => {
    const selectedLanguage = e.target.value;
    changeLanguage(selectedLanguage);
  });
});

function changeLanguage(language) {
  const translations = {
    en: {
      home: "Home",
      features: "Features",
      howItWorks: "How It Works",
      analyze: "Analyze",
      heroTitle: "PlantScan: Advanced Plant Analysis Tool",
      heroDescription: "Upload an image of a plant to receive a detailed analysis of its species, health, and care recommendations.",
      ctaButton: "Analyze Your Plant",
      featuresTitle: "Features",
      speciesIdentification: "Species Identification",
      speciesDescription: "Accurate plant species identification using advanced AI technology.",
      healthAssessment: "Health Assessment",
      healthDescription: "Detailed plant health assessment to identify potential issues.",
      careRecommendations: "Care Recommendations",
      careDescription: "Customized care recommendations tailored to your plant's needs.",
      pdfReports: "PDF Reports",
      pdfDescription: "Downloadable PDF reports with comprehensive analysis results.",
      howItWorksTitle: "How It Works",
      uploadStep: "Upload",
      uploadDescription: "Take a clear photo of your plant or upload an existing image.",
      analyzeStep: "Analyze",
      analyzeDescription: "Our AI processes the image and generates a detailed analysis.",
      resultsStep: "Results",
      resultsDescription: "Receive instant results with species info and care tips.",
      downloadStep: "Download",
      downloadDescription: "Get a comprehensive PDF report for future reference.",
      analyzeButton: "Analyze Plant",
      downloadPdfButton: "Download PDF Report",
      testimonials: "What Our Users Say",
    },
    hi: {
      home: "होम",
      features: "विशेषताएँ",
      howItWorks: "यह कैसे काम करता है",
      analyze: "विश्लेषण करें",
      heroTitle: "प्लांटस्कैन: उन्नत पौधा विश्लेषण उपकरण",
      heroDescription: "पौधे की प्रजाति, स्वास्थ्य और देखभाल की सिफारिशों का विस्तृत विश्लेषण प्राप्त करने के लिए पौधे की एक छवि अपलोड करें।",
      ctaButton: "अपने पौधे का विश्लेषण करें",
      featuresTitle: "विशेषताएँ",
      speciesIdentification: "प्रजाति पहचान",
      speciesDescription: "उन्नत एआई तकनीक का उपयोग करके सटीक पौधों की प्रजाति पहचान।",
      healthAssessment: "स्वास्थ्य मूल्यांकन",
      healthDescription: "संभावित समस्याओं की पहचान के लिए विस्तृत पौधा स्वास्थ्य मूल्यांकन।",
      careRecommendations: "देखभाल की सिफारिशें",
      careDescription: "आपके पौधे की जरूरतों के अनुसार अनुकूलित देखभाल की सिफारिशें।",
      // Add more translations as needed
    },
    // Add translations for other languages (bn, te, ta, mr) here
  };

  const elements = {
    home: document.querySelector('nav ul li:nth-child(1) a'),
    features: document.querySelector('nav ul li:nth-child(2) a'),
    howItWorks: document.querySelector('nav ul li:nth-child(3) a'),
    analyze: document.querySelector('nav ul li:nth-child(4) a'),
    heroTitle: document.querySelector('.hero-content h1'),
    heroDescription: document.querySelector('.hero-content p'),
    ctaButton: document.querySelector('.cta-button'),
    // Add more elements as needed
  };

  const languageData = translations[language] || translations.en;

  for (const [key, element] of Object.entries(elements)) {
    if (element && languageData[key]) {
      element.textContent = languageData[key];
    }
  }

  // Update analyze button text
  const analyzeButton = document.querySelector('.analyze-button');
  if (analyzeButton && languageData.analyzeButton) {
    analyzeButton.textContent = languageData.analyzeButton;
  }

  // Update download button text
  const downloadButton = document.getElementById('downloadButton');
  if (downloadButton && languageData.downloadPdfButton) {
    downloadButton.textContent = languageData.downloadPdfButton;
  }
}
