<template>
    <div :style="styles.container">
      <h2 :style="styles.heading">Télécharger le PDF</h2>
      <div :style="styles.formSection">
        <input
          type="text"
          :style="styles.input"
          v-model="projectName"
          placeholder="Nom du projet"
          @focus="error = ''"
        />
        <button :style="styles.button" @click="downloadPDF" :disabled="loading">
          {{ loading ? 'Génération en cours...' : 'Télécharger PDF' }}
        </button>
      </div>
      <p :style="styles.error" v-if="error">{{ error }}</p>
      <div :style="styles.schemaContainer">
        <svg :style="styles.schema" v-if="schemaData">
          <!-- Contenu du schéma ici -->
        </svg>
      </div>
    </div>
  </template>
  
  
  <script>
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default {
  data() {
    return {
      projectName: '',
      error: '',
      loading: false,
      styles: {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  heading: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  formSection: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    marginBottom: '2.5rem', // Augmentation de la marge pour espacer le bouton du schéma
    textAlign: 'center' // S'assurer que les éléments du formulaire sont centrés
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    transition: 'border-color 0.3s'
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '200px', // Limiter la largeur du bouton
    margin: '0 auto'  // Centrer le bouton
  },
  error: {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    textAlign: 'center'
  },
  schemaContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
    minHeight: '400px' // Définir une hauteur minimale pour bien centrer le schéma
  },
  schema: {
    maxWidth: '100%',
    height: 'auto'
  }
}

    };
  },
  methods: {
    async downloadPDF() {
      this.error = '';
      this.loading = true;

      if (!this.projectName) {
        this.error = 'Veuillez entrer le nom du projet.';
        this.loading = false;
        return;
      }

      try {
        const schemaData = JSON.parse(localStorage.getItem('schema'));
        if (schemaData) {
          const svgData = new XMLSerializer().serializeToString(schemaData.svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.onload = () => {
            const pdf = new jsPDF({
              orientation: 'l',
              unit: 'px',
              format: 'a4',
              compress: true
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL('image/jpeg', 2.0);

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const aspectRatio = canvas.width / canvas.height;

            let imgWidth = pdfWidth;
            let imgHeight = pdfWidth / aspectRatio;

            if (imgHeight > pdfHeight) {
              imgHeight = pdfHeight;
              imgWidth = pdfHeight * aspectRatio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight) / 15;

            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

            pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');

            pdf.setProperties({
              title: this.projectName,
              subject: 'Schéma électrique',
              author: 'SUDELEC',
              keywords: 'schéma, électrique, ' + this.projectName,
              creator: 'SUDELEC Schema Generator'
            });

            pdf.save(`${this.projectName}.pdf`);

            URL.revokeObjectURL(url);
          };

          img.src = url;
        } else {
          this.error = 'Aucun schéma trouvé dans le localStorage.';
        }
      } catch (err) {
        this.error = 'Une erreur est survenue lors de la génération du PDF.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>


  <style scoped>
  /* Ajoutez des styles spécifiques si nécessaire */
  </style>
  