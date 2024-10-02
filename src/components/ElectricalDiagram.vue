<template>
  <div :style="styles.container">
    <form @submit.prevent="handleSubmit" :style="styles.form">
      <h2 :style="styles.heading">Cartouche Information</h2>
      <input
        type="text"
        name="projectName"
        placeholder="Project Name"
        v-model="cartouche.projectName"
        :style="styles.input"
        required
      />
      <input
        type="date"
        name="date"
        v-model="cartouche.date"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="reference"
        placeholder="Reference"
        v-model="cartouche.reference"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="client"
        placeholder="Client"
        v-model="cartouche.client"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="building"
        placeholder="Building"
        v-model="cartouche.building"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="folioNumber"
        placeholder="Folio Number"
        v-model="cartouche.folioNumber"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="designer"
        placeholder="Designer"
        v-model="cartouche.designer"
        :style="styles.input"
        required
      />
      <input
        type="text"
        name="approval"
        placeholder="Approval"
        v-model="cartouche.approval"
        :style="styles.input"
        required
      />

      <h2 :style="styles.subHeading">Composants Disponibles</h2>
      <div :style="styles.componentList">
        <div
          v-for="(comp, index) in availableComponents"
          :key="index"
          :style="styles.componentButton"
          draggable="true"
          @dragstart="dragStart($event, comp)"
        >
          {{ comp.name }}
        </div>
      </div>

      <h2 :style="styles.subHeading">Grille de Composants</h2>
      <div :style="styles.gridContainer">
        <div
          v-for="row in gridHeight"
          :key="`row-${row}`"
          :style="styles.gridRow"
        >
          <div
            v-for="col in gridWidth"
            :key="`cell-${row}-${col}`"
            :style="getCellStyle(row - 1, col - 1)"
            @drop="onDrop($event, row - 1, col - 1)"
            @dragover.prevent
            @dragenter.prevent
          >
            {{ getCellContent(row - 1, col - 1) }}
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

      <button
        type="submit"
        :style="isFormValid ? styles.button : styles.buttonDisabled"
        :disabled="!isFormValid"
      >
        Générer le Schéma
      </button>
      <button :style="styles.button" @click="downloadPDF">Télécharger PDF</button>
      <button :style="styles.button" @click="saveSchema">Sauvegarder le Schéma</button>
      <button :style="styles.button" @click="loadSchema">Charger le Schéma</button>
    </form>

    <div :style="styles.svgContainer">
      <svg ref="svg" width="800" height="700"></svg>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default {
  data() {
    return {
      selectedComponents: [],
      currentComponent: null,
      parentComponent: null,
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
      isFormValid: false,
      errorMessage: '',
      availableComponents: [
        { name: 'Disjoncteur', type: 'disjoncteur', characteristics: '4P 100A' },
        { name: 'Prise', type: 'prise', characteristics: '1P 16A' },
        { name: 'Interrupteur', type: 'interrupteur', characteristics: '1P 10A' },
        { name: 'Lampe', type: 'lampe', characteristics: 'Lampe' }
      ],
      grid: Array.from({ length: 5 }, () => Array(10).fill(null)),
      draggedComponent: null,
      styles: {
        container: {
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
        },
        form: {
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        },
        heading: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        subHeading: {
          fontSize: '20px',
          marginBottom: '10px',
        },
        input: {
          padding: '8px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginBottom: '10px',
        },
        componentList: {
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
        },
        componentButton: {
          padding: '10px',
          border: '1px solid #ccc',
          cursor: 'move',
        },
        gridContainer: {
          overflow: 'auto',
        },
        grid: {
          display: 'table',
          borderCollapse: 'collapse',
        },
        gridRow: {
          display: 'table-row',
        },
        gridCell: {
          display: 'table-cell',
          width: '80px',
          height: '80px',
          border: '1px solid #ccc',
          textAlign: 'center',
          verticalAlign: 'middle',
        },
        cellOccupied: {
          backgroundColor: '#e0e0e0',
        },
        component: {
          margin: '5px 0',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '4px',
        },
        removeButton: {
          padding: '5px 10px',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        button: {
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        },
        buttonDisabled: {
          padding: '10px 20px',
          backgroundColor: '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'not-allowed',
          fontSize: '16px',
        },
        svgContainer: {
          marginTop: '20px',
        }
      }
    };
  },
  computed: {
    gridHeight() {
      return 5;
    },
    gridWidth() {
      return 10;
    }
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
        this.draggedComponent = null;
        this.validateForm(); // Valider après ajout de composant
      }
    },

    getCellStyle(row, col) {
      return {
        ...this.styles.gridCell,
        ...(this.grid[row][col] ? this.styles.cellOccupied : {})
      };
    },

    getCellContent(row, col) {
      const component = this.grid[row][col];
      return component ? component.name : '';
    },

    removeComponent(id) {
      const index = this.selectedComponents.findIndex(comp => comp.id === id);
      if (index !== -1) {
        const component = this.selectedComponents[index];
        this.grid[component.row - 1][component.column - 1] = null;
        this.selectedComponents.splice(index, 1);
        this.validateForm(); // Valider après suppression de composant
      }
    },

    createSVGElement(type, attributes) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", type);
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
      return element;
    },

    drawFrame(svg) {
      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 10, width: 780, height: 580, fill: '#ffffff', stroke: 'black', 'stroke-width': 1 }));

      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40, x2: 790, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
      for (let i = 0; i < 10; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 78, y1: 10, x2: 10 + i * 78, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
        const text = this.createSVGElement('text', { x: 49 + i * 78, y: 30, 'text-anchor': 'middle', 'font-size': 12, fill: '#000000' });
        text.textContent = i + 1;
        svg.appendChild(text);
      }

      for (let i = 0; i <= 10; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 78, y1: 40, x2: 10 + i * 78, y2: 520, stroke: 'black', 'stroke-width': 0.5 }));
      }
      for (let i = 0; i < 6; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40 + i * 60, x2: 790, y2: 40 + i * 60, stroke: 'black', 'stroke-width': 0.5 }));
      }

      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 520, width: 780, height: 70, fill: '#ffffff', stroke: 'black', 'stroke-width': 1 }));

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
      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 550, x2: 790, y2: 550, stroke: 'black', 'stroke-width': 0.5 }));

      const cartoucheTexts = [
        { x: 205, y: 535, content: 'VERIFIE:', size: 10, color: '#000000' },
        { x: 205, y: 565, content: 'APPROUVE:', size: 10, color: '#000000' },
        { x: 405, y: 535, content: this.cartouche.client, size: 12, color: '#000000' },
        { x: 405, y: 565, content: this.cartouche.building, size: 10, color: '#000000' },
        { x: 405, y: 580, content: 'Régal - Pointe-Noire', size: 10, color: '#000000' },
        { x: 605, y: 535, content: this.cartouche.projectName, size: 10, color: '#000000' },
        { x: 605, y: 565, content: this.cartouche.reference, size: 10, color: '#000000' },
        { x: 770, y: 580, content: this.cartouche.folioNumber, size: 14, anchor: 'end', weight: 'bold', color: '#000000' },
        { x: 205, y: 580, content: 'DATE DE CREATION:', size: 8, color: '#000000' },
        { x: 280, y: 580, content: this.cartouche.date, size: 8, color: '#000000' },
        { x: 320, y: 580, content: 'Création', size: 8, color: '#000000' },
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

    async handleSubmit() {
      if (!this.isFormValid) return;

      const svg = this.$refs.svg;
      // Nettoyer le SVG existant
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Définir les dimensions de base
      const GRID_START_X = 10;
      const GRID_START_Y = 40;
      const CELL_WIDTH = 78;
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

      try {
        await fetch('/api/components', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.selectedComponents)
        });
        console.log('Composants envoyés avec succès');
      } catch (err) {
        console.error('Erreur lors de l\'envoi des composants', err);
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
  const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
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
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
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
    const y = (pdfHeight - imgHeight) / 2;
    
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
},

    saveSchema() {
      const schemaData = {
        cartouche: this.cartouche,
        selectedComponents: this.selectedComponents,
        grid: this.grid
      };
      localStorage.setItem('schema', JSON.stringify(schemaData));
      console.log('Schéma sauvegardé');
    },

    loadSchema() {
      const schemaData = JSON.parse(localStorage.getItem('schema'));
      if (schemaData) {
        this.cartouche = schemaData.cartouche;
        this.selectedComponents = schemaData.selectedComponents;
        this.grid = schemaData.grid;
        this.validateForm(); // Valider après chargement du schéma
        console.log('Schéma chargé');
      } else {
        console.log('Aucun schéma trouvé');
      }
    },

    validateForm() {
      const isCartoucheValid = Object.values(this.cartouche).every(value => value !== '');
      const isAtLeastOneComponent = this.selectedComponents.length > 0;
      this.isFormValid = isCartoucheValid && isAtLeastOneComponent;
      console.log('Validation form:', { isCartoucheValid, isAtLeastOneComponent, isFormValid: this.isFormValid });
    }
  }
};
</script>

<style scoped>
.component-list {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.component-button {
  padding: 10px;
  border: 1px solid #ccc;
  cursor: move;
}
.grid-container {
  overflow: auto;
  max-height: 400px;
}
.grid {
  display: table;
}
.grid-row {
  display: table-row;
}
.grid-cell {
  display: table-cell;
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
}
.cell-occupied {
  background-color: #e0e0e0;
}
.generate-button {
  margin-top: 20px;
  padding: 10px 20px;
}
.svg-container {
  margin-top: 20px;
}
</style>
