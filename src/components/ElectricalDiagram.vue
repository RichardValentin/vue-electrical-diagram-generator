<template>
  <div :style="styles.container">
    <form @submit.prevent="handleSubmit" :style="styles.form">
      <h2 :style="styles.heading">Informations du Cartouche</h2>
      <div :style="styles.formSection">
        <input type="text" name="projectName" placeholder="Nom du projet" v-model="cartouche.projectName" :style="styles.input" required />
        <input type="date" name="date" v-model="cartouche.date" :style="styles.input" required />
        <input type="text" name="reference" placeholder="Référence" v-model="cartouche.reference" :style="styles.input" required />
        <input type="text" name="client" placeholder="Client" v-model="cartouche.client" :style="styles.input" required />
        <input type="text" name="building" placeholder="Bâtiment" v-model="cartouche.building" :style="styles.input" required />
        <input type="text" name="folioNumber" placeholder="Numéro de Folio" v-model="cartouche.folioNumber" :style="styles.input" required />
        <input type="text" name="designer" placeholder="Concepteur" v-model="cartouche.designer" :style="styles.input" required />
        <input type="text" name="approval" placeholder="Approbation" v-model="cartouche.approval" :style="styles.input" required />
      </div>

      <h2 :style="styles.subHeading">Composants Disponibles</h2>
      <div :style="styles.componentList">
        <div v-for="(comp, index) in availableComponents" :key="index" :style="styles.componentButton" draggable="true" @dragstart="dragStart($event, comp)">
          {{ comp.name }}
        </div>
      </div>

      <h2 :style="styles.subHeading">Grille de Composants</h2>
      <div :style="styles.gridWrapper">
        <div :style="styles.gridContainer">
          <div v-for="row in gridHeight" :key="`row-${row}`" :style="styles.gridRow">
            <div v-for="col in gridWidth" :key="`cell-${row}-${col}`" :style="getCellStyle(row - 1, col - 1)" @drop="onDrop($event, row - 1, col - 1)" @dragover.prevent @dragenter.prevent>
              {{ getCellContent(row - 1, col - 1) }}
            </div>
          </div>
        </div>
      </div>

      <h2 :style="styles.subHeading">Composants Sélectionnés</h2>
      <div>
        <div v-for="comp in selectedComponents" :key="comp.id" :style="styles.component">
          {{ comp.name }} - Type: {{ comp.type }}, Position: ({{ comp.column }}, {{ comp.row }})
          <button @click="removeComponent(comp.id)" :style="styles.removeButton">Supprimer</button>
        </div>
      </div>

      <div v-if="errorMessage" :style="styles.errorMessage">
        {{ errorMessage }}
      </div>

      <button type="submit" :style="isFormValid ? styles.button : styles.buttonDisabled" :disabled="!isFormValid">Générer le Schéma</button>
      <button :style="styles.button" @click="downloadPDF">Télécharger PDF</button>
      <button :style="styles.button" @click="saveSchema">Sauvegarder le Schéma</button>
      <button :style="styles.button" @click="loadSchema">Charger le Schéma</button>
    </form>

    <div :style="styles.svgContainer">
      <svg ref="svg" width="900" height="600"></svg>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default {
  data() {
    return {
      cartouche: {
        projectName: '',
        date: '',
        reference: '',
        client: '',
        building: '',
        folioNumber: '',
        designer: '',
        approval: ''
      },
      availableComponents: [
        { name: 'Disjoncteur', type: 'disjoncteur', characteristics: '4P 100A' },
        { name: 'Prise', type: 'prise', characteristics: '1P 16A' },
        { name: 'Interrupteur', type: 'interrupteur', characteristics: '1P 10A' },
        { name: 'Lampe', type: 'lampe', characteristics: 'Lampe' }
      ],
      selectedComponents: [],
      gridWidth: 21,
      gridHeight: 5,
      grid: Array.from({ length: 5 }, () => Array(21).fill(null)),
      isFormValid: false,
      draggedComponent: null,
      errorMessage: '',
      styles: {
        container: {
          maxWidth: '960px',
          margin: '0 auto',
          padding: '20px',
          fontFamily: 'Roboto, sans-serif',
        },
        form: {
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        formSection: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        },
        heading: {
          fontSize: '26px',
          fontWeight: 'bold',
          color: '#343a40',
        },
        subHeading: {
          fontSize: '22px',
          marginBottom: '12px',
          color: '#495057',
        },
        input: {
          padding: '10px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          transition: 'border-color 0.3s',
        },
        inputFocus: {
          borderColor: '#007bff',
        },
        componentList: {
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        },
        componentButton: {
          padding: '12px 16px',
          backgroundColor: '#e9ecef',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          cursor: 'move',
          transition: 'background-color 0.3s',
        },
        componentButtonHover: {
          backgroundColor: '#dee2e6',
        },
        gridWrapper: {
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          marginBottom: '20px',
          padding: '10px'
        },
        gridContainer: {
          display: 'table',
          borderCollapse: 'collapse',
          width: 'fit-content',
          minWidth: '100%',
          tableLayout: 'fixed',
          backgroundColor: '#fff',
          border: '1px solid #ced4da',
          borderRadius: '4px'
        },
        gridRow: {
          display: 'table-row',
          height: '80px'
        },
        gridCell: {
          display: 'table-cell',
          width: '80px',
          height: '80px',
          minWidth: '80px',
          maxWidth: '80px',
          border: '1px solid #dee2e6',
          textAlign: 'center',
          verticalAlign: 'middle',
          position: 'relative',
          padding: '0',
          transition: 'background-color 0.3s'
        },
        cellOccupied: {
          backgroundColor: '#e9ecef'
        },
        component: {
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          marginBottom: '8px',
        },
        removeButton: {
          marginLeft: '10px',
          padding: '5px 10px',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        button: {
          padding: '12px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        },
        buttonHover: {
          backgroundColor: '#0056b3',
        },
        buttonDisabled: {
          padding: '12px 20px',
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
        },
        svgContainer: {
          marginTop: '20px',
          border: '1px solid #ced4da',
          backgroundColor: '#f8f9fa',
          padding: '10px',
          borderRadius: '8px',
        },
        errorMessage: {
          color: 'red',
          fontWeight: 'bold',
        }
      }
    };
  },
  methods: {
    dragStart(event, component) {
      this.draggedComponent = { ...component, id: Date.now() };
    },
    onDrop(event, row, col) {
      if (this.draggedComponent && !this.grid[row][col]) {
        const newComponent = {
          ...this.draggedComponent,
          row: row + 1,
          column: col + 1,
        };
        this.grid[row][col] = newComponent;
        this.selectedComponents.push(newComponent);
        this.validateForm();
      } else if (this.grid[row][col]) {
        this.errorMessage = 'Cette cellule est déjà occupée.';
      } else {
        this.errorMessage = 'Impossible de déposer le composant ici.';
      }
      this.draggedComponent = null;
    },
    getCellStyle(row, col) {
      return {
        ...this.styles.gridCell,
        ...(this.grid[row][col] ? this.styles.cellOccupied : {})
      };
    },
    getCellContent(row, col) {
      const component = this.grid[row][col];
      return component ? component.name : this.getCellNumber(row, col);
    },
    getCellNumber(row, col) {
      return String.fromCharCode(65 + col) + (row + 1);
    },
    removeComponent(id) {
      const index = this.selectedComponents.findIndex(comp => comp.id === id);
      if (index !== -1) {
        const component = this.selectedComponents[index];
        this.grid[component.row - 1][component.column - 1] = null;
        this.selectedComponents.splice(index, 1);
        this.validateForm();
      }
    },
    validateForm() {
      const isCartoucheValid = Object.values(this.cartouche).every(value => value !== '');
      const isAtLeastOneComponent = this.selectedComponents.length > 0;
      this.isFormValid = isCartoucheValid && isAtLeastOneComponent;
      this.errorMessage = isCartoucheValid && isAtLeastOneComponent ? '' : 'Veuillez remplir tous les champs et ajouter au moins un composant.';
    },
    handleSubmit() {
      if (!this.isFormValid) return;
      this.generateSchema();
    },
    generateSchema() {
      const svg = this.$refs.svg;
      // Nettoyer le SVG existant
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Définir les dimensions de base
      const GRID_START_X = 10;
      const GRID_START_Y = 40;
      const CELL_WIDTH = 42;
      const CELL_HEIGHT = 80;

      // Dessiner d'abord le cadre et la grille
      this.drawFrame(svg);

      // Dessiner tous les composants
      this.selectedComponents.forEach(component => {
        const x = GRID_START_X + (component.column - 1) * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_START_Y + (component.row - 1) * CELL_HEIGHT + CELL_HEIGHT / 2;

        switch (component.type) {
          case 'disjoncteur':
            this.drawCircuitBreaker(svg, x, y, component.characteristics);
            break;
          case 'prise':
            this.drawOutlet(svg, x, y, component.characteristics);
            break;
          case 'interrupteur':
            this.drawSwitch(svg, x, y, component.characteristics);
            break;
          case 'lampe':
            this.drawLamp(svg, x, y, component.characteristics);
            break;
        }
      });
    },
    drawFrame(svg) {
      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 10, width: 880, height: 580, fill: '#ffffff', stroke: 'black', 'stroke-width': 1 }));

      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40, x2: 890, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
      for (let i = 0; i < 21; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 42, y1: 10, x2: 10 + i * 42, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
        const text = this.createSVGElement('text', { x: 24 + i * 42, y: 30, 'text-anchor': 'middle', 'font-size': 12, fill: '#000000' });
        text.textContent = i + 1;
        svg.appendChild(text);
      }

      // Modification ici : on dessine une ligne de moins pour la grille verticale
      for (let i = 0; i < 21; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 42, y1: 40, x2: 10 + i * 42, y2: 520, stroke: 'black', 'stroke-width': 0.5 }));
      }
      for (let i = 0; i < 5; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40 + i * 80, x2: 890, y2: 40 + i * 80, stroke: 'black', 'stroke-width': 0.5 }));
        const text = this.createSVGElement('text', { x: 15, y: 45 + i * 80, 'text-anchor': 'middle', 'font-size': 12, fill: '#000000' });
        text.textContent = i + 1;
        svg.appendChild(text);
      }

      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 520, width: 880, height: 70, fill: '#ffffff', stroke: 'black', 'stroke-width': 1 }));

      const sudelecText = this.createSVGElement('text', { x: 20, y: 540, 'font-size': 24, fill: '#000000', 'font-weight': 'bold' });
      sudelecText.textContent = 'SUDELEC';
      svg.appendChild(sudelecText);

      const addressText = this.createSVGElement('text', { x: 20, y: 555, 'font-size': 8, fill: '#000000' });
      addressText.textContent = 'B.P. 1773 - Pointe-Noire/R.CONGO';
      svg.appendChild(addressText);

      const phoneText = this.createSVGElement('text', { x: 20, y: 565, 'font-size': 8, fill: '#000000' });
      phoneText.textContent = 'Tél : +242 22 294 53 70 www.sudelec-congo.com';
      svg.appendChild(phoneText);

      svg.appendChild(this.createSVGElement('line', { x1: 200, y1: 520, x2: 200, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 400, y1: 520, x2: 400, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 600, y1: 520, x2: 600, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 550, x2: 890, y2: 550, stroke: 'black', 'stroke-width': 0.5 }));

      const cartoucheTexts = [
        { x: 205, y: 535, content: 'VERIFIE:', size: 10, color: '#000000' },
        { x: 205, y: 565, content: 'APPROUVE:', size: 10, color: '#000000' },
        { x: 205, y: 580, content: 'DATE DE CREATION:', size: 8, color: '#000000' },
        { x: 280, y: 580, content: this.cartouche.date, size: 8, color: '#000000' },
        { x: 320, y: 580, content: 'Création', size: 8, color: '#000000' },
        { x: 405, y: 535, content: this.cartouche.client, size: 12, color: '#000000' },
        { x: 405, y: 565, content: this.cartouche.building, size: 10, color: '#000000' },
        { x: 405, y: 580, content: 'Régal - Pointe-Noire', size: 10, color: '#000000' },
        { x: 605, y: 535, content: this.cartouche.projectName, size: 10, color: '#000000' },
        { x: 605, y: 565, content: this.cartouche.reference, size: 10, color: '#000000' },
        { x: 770, y: 580, content: this.cartouche.folioNumber, size: 14, anchor: 'end', weight: 'bold', color: '#000000' },
        { x: 770, y: 535, content: 'FOLIO', size: 10, anchor: 'end', color: '#000000' }
      ];

      cartoucheTexts.forEach(text => {
        const textElement = this.createSVGElement('text', {
          x: text.x,
          y: text.y,
          'font-size': text.size,
          'text-anchor': text.anchor || 'start',
          'font-weight': text.weight || 'normal',
          fill: text.color
        });
        textElement.textContent = text.content;
        svg.appendChild(textElement);
      });
    },
    createSVGElement(type, attributes) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", type);
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
      return element;
    },
    drawCircuitBreaker(svg, x, y, label) {
      const group = this.createSVGElement('g', { transform: `translate(${x},${y})` });

      // Rectangle principal
      group.appendChild(this.createSVGElement('rect', {
        x: -15,
        y: -15,
        width: 30,
        height: 30,
        fill: 'none',
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Ligne diagonale
      group.appendChild(this.createSVGElement('line', {
        x1: -10,
        y1: 10,
        x2: 10,
        y2: -10,
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Texte du label
      const text = this.createSVGElement('text', {
        x: 0,
        y: 25,
        'text-anchor': 'middle',
        'font-size': '8',
        fill: 'black'
      });
      text.textContent = label;
      group.appendChild(text);

      svg.appendChild(group);
    },
    drawOutlet(svg, x, y, label) {
      const group = this.createSVGElement('g', { transform: `translate(${x},${y})` });

      // Cercle principal
      group.appendChild(this.createSVGElement('circle', {
        cx: 0,
        cy: 0,
        r: 15,
        fill: 'none',
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Points intérieurs
      group.appendChild(this.createSVGElement('circle', {
        cx: -5,
        cy: 0,
        r: 2,
        fill: 'black'
      }));

      group.appendChild(this.createSVGElement('circle', {
        cx: 5,
        cy: 0,
        r: 2,
        fill: 'black'
      }));

      // Texte du label
      const text = this.createSVGElement('text', {
        x: 0,
        y: 25,
        'text-anchor': 'middle',
        'font-size': '8',
        fill: 'black'
      });
      text.textContent = label;
      group.appendChild(text);

      svg.appendChild(group);
    },
    drawSwitch(svg, x, y, label) {
      const group = this.createSVGElement('g', { transform: `translate(${x},${y})` });

      // Ligne de base
      group.appendChild(this.createSVGElement('line', {
        x1: -15,
        y1: 0,
        x2: 15,
        y2: 0,
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Ligne de l'interrupteur
      group.appendChild(this.createSVGElement('line', {
        x1: -15,
        y1: 0,
        x2: 10,
        y2: -15,
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Texte du label
      const text = this.createSVGElement('text', {
        x: 0,
        y: 25,
        'text-anchor': 'middle',
        'font-size': '8',
        fill: 'black'
      });
      text.textContent = label;
      group.appendChild(text);

      svg.appendChild(group);
    },
    drawLamp(svg, x, y, label) {
      const group = this.createSVGElement('g', { transform: `translate(${x},${y})` });

      // Cercle principal
      group.appendChild(this.createSVGElement('circle', {
        cx: 0,
        cy: 0,
        r: 15,
        fill: 'none',
        stroke: 'black',
        'stroke-width': '1.5'
      }));

      // Croix intérieure
      group.appendChild(this.createSVGElement('line', {
        x1: -10,
        y1: -10,
        x2: 10,
        y2: 10,
        stroke: 'black',
        'stroke-width': '1'
      }));

      group.appendChild(this.createSVGElement('line', {
        x1: -10,
        y1: 10,
        x2: 10,
        y2: -10,
        stroke: 'black',
        'stroke-width': '1'
      }));

      // Texte du label
      const text = this.createSVGElement('text', {
        x: 0,
        y: 25,
        'text-anchor': 'middle',
        'font-size': '8',
        fill: 'black'
      });
      text.textContent = label;
      group.appendChild(text);

      svg.appendChild(group);
    },
    saveSchema() {
      const schemaData = {
        cartouche: this.cartouche,
        selectedComponents: this.selectedComponents,
        grid: this.grid
      };
      localStorage.setItem('schema', JSON.stringify(schemaData));
    },
    loadSchema() {
      const schemaData = JSON.parse(localStorage.getItem('schema'));
      if (schemaData) {
        this.cartouche = schemaData.cartouche;
        this.selectedComponents = schemaData.selectedComponents;
        this.grid = schemaData.grid;
        this.validateForm();
      }
    },
    downloadPDF() {
      const svg = this.$refs.svg;

      // Définir une échelle plus grande pour une meilleure qualité
      const scale = 4;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Augmenter la taille du canvas pour une meilleure résolution
      canvas.width = svg.width.baseVal.value * scale;
      canvas.height = svg.height.baseVal.value * scale;

      // Configurer le contexte pour un meilleur rendu
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Effacer le canvas avec un fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dessiner l'image mise à l'échelle
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        // Créer le PDF avec une meilleure qualité
        const pdf = new jsPDF({
          orientation: 'l',
          unit: 'px',
          format: 'a4',
          compress: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 2.0);

        // Calculer les dimensions pour ajuster au format A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const aspectRatio = canvas.width / canvas.height;

        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / aspectRatio;

        // Ajuster si l'image est trop haute
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * aspectRatio;
        }

        // Centrer l'image dans la page
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight) / 15;

        // Définir un fond blanc pour la page
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // Ajouter l'image au PDF avec la meilleure qualité
        pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');

        // Ajouter des métadonnées
        pdf.setProperties({
          title: this.cartouche.projectName,
          subject: 'Schéma électrique',
          author: 'SUDELEC',
          keywords: 'schéma, électrique, ' + this.cartouche.projectName,
          creator: 'SUDELEC Schema Generator'
        });

        // Sauvegarder le PDF
        pdf.save(`${this.cartouche.projectName}.pdf`);

        // Nettoyer
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  }
};
</script>

<style scoped>
/* Supprimez les styles de grille existants car nous utilisons maintenant des styles inline */
.grid-container, .grid-row, .grid-cell {
  all: unset;
}

/* Ajoutez des styles pour le scrolling horizontal fluide */
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
