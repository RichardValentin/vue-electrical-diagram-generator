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
      <div :style="styles.grid">
        <div
          v-for="row in 5"
          :key="`row-${row}`"
          :style="styles.gridRow"
        >
          <div
            v-for="col in 10"
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
    </form>

    <div :style="styles.svgContainer">
      <svg ref="svg" width="800" height="600"></svg>
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
        folioNumber: ''
      },
      isFormValid: false,
      errorMessage: '',
      availableComponents: [
        { name: 'Disjoncteur', type: 'disjoncteur' },
        { name: 'Prise', type: 'prise' },
        { name: 'Interrupteur', type: 'interrupteur' },
        { name: 'Lampe', type: 'lampe' }
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
      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 10, width: 780, height: 580, fill: 'none', stroke: 'black', 'stroke-width': 1 }));

      // Draw vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = 10 + i * 78;
        svg.appendChild(this.createSVGElement('line', { x1: x, y1: 10, x2: x, y2: 520, stroke: 'black', 'stroke-width': 0.5 }));
        const text = this.createSVGElement('text', { x: x + 34, y: 5, 'text-anchor': 'middle', 'font-size': 12 });
        text.textContent = i + 1;
        svg.appendChild(text);
      }

      // Draw horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = 40 + i * 60;
        svg.appendChild(this.createSVGElement('line', { x1: 10, y1: y, x2: 790, y2: y, stroke: 'black', 'stroke-width': 0.5 }));
      }

      svg.appendChild(this.createSVGElement('rect', { x: 10, y: 520, width: 780, height: 70, fill: 'none', stroke: 'black', 'stroke-width': 1 }));

      const sudelecText = this.createSVGElement('text', { x: 20, y: 540, 'font-size': 24, fill: 'red', 'font-weight': 'bold' });
      sudelecText.textContent = 'SUDELEC';
      svg.appendChild(sudelecText);

      const addressText = this.createSVGElement('text', { x: 20, y: 555, 'font-size': 8 });
      addressText.textContent = 'B.P. 1773 - Pointe-Noire/R.CONGO';
      svg.appendChild(addressText);

      const phoneText = this.createSVGElement('text', { x: 20, y: 565, 'font-size': 8 });
      phoneText.textContent = 'Tél : +242 22 294 53 70 www.sudelec-congo.com';
      svg.appendChild(phoneText);

      svg.appendChild(this.createSVGElement('line', { x1: 200, y1: 520, x2: 200, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 400, y1: 520, x2: 400, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 600, y1: 520, x2: 600, y2: 590, stroke: 'black', 'stroke-width': 0.5 }));
      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 550, x2: 790, y2: 550, stroke: 'black', 'stroke-width': 0.5 }));

      const cartoucheTexts = [
        { x: 205, y: 535, content: 'VERIFIE:', size: 10 },
        { x: 205, y: 565, content: 'APPROUVE:', size: 10 },
        { x: 405, y: 535, content: this.cartouche.client, size: 12 },
        { x: 405, y: 565, content: this.cartouche.building, size: 10 },
        { x: 405, y: 580, content: 'Régal - Pointe-Noire', size: 10 },
        { x: 605, y: 535, content: this.cartouche.projectName, size: 10 },
        { x: 605, y: 565, content: this.cartouche.reference, size: 10 },
        { x: 770, y: 580, content: this.cartouche.folioNumber, size: 14, anchor: 'end', weight: 'bold' },
        { x: 205, y: 580, content: 'DATE DE CREATION:', size: 8 },
        { x: 280, y: 580, content: this.cartouche.date, size: 8 },
        { x: 320, y: 580, content: 'Création', size: 8 },
        { x: 770, y: 535, content: 'FOLIO', size: 10, anchor: 'end' }
      ];

      cartoucheTexts.forEach(text => {
        const textElement = this.createSVGElement('text', {
          x: text.x,
          y: text.y,
          'font-size': text.size,
          'text-anchor': text.anchor || 'start',
          'font-weight': text.weight || 'normal'
        });
        textElement.textContent = text.content;
        svg.appendChild(textElement);
      });
    },

    drawCircuitBreaker(svg, x, y, label) {
      const group = this.createSVGElement('g', {});
      group.appendChild(this.createSVGElement('rect', {
        x: x - 20, y: y - 20, width: 40, height: 40,
        fill: 'none', stroke: 'black', 'stroke-width': 2
      }));
      group.appendChild(this.createSVGElement('line', {
        x1: x - 10, y1: y, x2: x + 10, y2: y - 10,
        stroke: 'black', 'stroke-width': 2
      }));
      const text = this.createSVGElement('text', {
        x: x, y: y + 40, 'text-anchor': 'middle',
        'font-size': '10'
      });
      text.textContent = label;
      group.appendChild(text);
      svg.appendChild(group);
    },

    drawOutlet(svg, x, y, label) {
      const group = this.createSVGElement('g', {});
      group.appendChild(this.createSVGElement('circle', {
        cx: x, cy: y, r: 20,
        fill: 'none', stroke: 'black', 'stroke-width': 2
      }));
      group.appendChild(this.createSVGElement('line', {
        x1: x, y1: y + 5, x2: x, y2: y + 15,
        stroke: 'black', 'stroke-width': 2
      }));
      const text = this.createSVGElement('text', {
        x: x, y: y + 30, 'text-anchor': 'middle',
        'font-size': '8'
      });
      text.textContent = label;
      group.appendChild(text);
      svg.appendChild(group);
    },

    drawGenericComponent(svg, x, y, label) {
      const rect = this.createSVGElement('rect', {
        x: x - 25, y: y - 20, width: 50, height: 40,
        fill: 'red', stroke: 'black', 'stroke-width': '1'
      });
      const text = this.createSVGElement('text', {
        x: x, y: y + 5, 'text-anchor': 'middle',
        'font-size': '10', fill: 'white'
      });
      text.textContent = label;
      svg.appendChild(rect);
      svg.appendChild(text);
    },

    drawLink(svg, fromX, fromY, toX, toY) {
      svg.appendChild(this.createSVGElement('line', {
        x1: fromX, y1: fromY, x2: toX, y2: toY,
        stroke: 'black', 'stroke-width': 1
      }));
    },

    drawComponentHierarchy(svg, component, x, y) {
      const cellWidth = 70; // Largeur de la cellule
      const cellHeight = 60; // Hauteur de la cellule

      // Calculer les coordonnées de centre de la cellule
      const cellCenterX = x * cellWidth + cellWidth / 2;
      const cellCenterY = y * cellHeight + cellHeight / 2;

      if (component.type === 'disjoncteur') {
        this.drawCircuitBreaker(svg, cellCenterX, cellCenterY, component.characteristics);
      } else if (component.type === 'prise') {
        this.drawOutlet(svg, cellCenterX, cellCenterY, component.characteristics);
      } else {
        this.drawGenericComponent(svg, cellCenterX, cellCenterY, component.characteristics);
      }

      if (component.children && component.children.length > 0) {
        const childrenY = y + 1; // Décaler les enfants d'une cellule vers le bas
        const childrenWidth = component.children.length * cellWidth;
        const childrenStartX = x - (childrenWidth / 2) + 0.5;

        component.children.forEach((child, index) => {
          const childX = childrenStartX + (index * cellWidth);
          this.drawLink(svg, cellCenterX, cellCenterY, childX, childrenY + cellHeight / 2);
          this.drawComponentHierarchy(svg, child, childX, childrenY);
        });
      }
    },

    async handleSubmit() {
      if (!this.isFormValid) return;

      const svg = this.$refs.svg;

      // Clear existing SVG content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Draw the grid
      this.drawGrid(svg);

      // Draw components
      this.selectedComponents.forEach(comp => {
        this.drawComponent(svg, comp);
      });

      // Draw the cartouche information
      this.drawFrame(svg);

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

    drawGrid(svg) {
      const cellWidth = 80;
      const cellHeight = 80;
      const gridWidth = 10 * cellWidth;
      const gridHeight = 5 * cellHeight;

      // Draw horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = 40 + i * 60;
        svg.appendChild(this.createSVGElement('line', {
          x1: 0, y1: y, x2: gridWidth, y2: y,
          stroke: 'black', 'stroke-width': 0.5
        }));
      }

      // Draw vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = 10 + i * 78;
        svg.appendChild(this.createSVGElement('line', {
          x1: x, y1: 10, x2: x, y2: gridHeight,
          stroke: 'black', 'stroke-width': 0.5
        }));
      }
    },

    drawComponent(svg, component) {
      const cellWidth = 80;
      const cellHeight = 80;
      const x = (component.column - 1) * cellWidth + cellWidth / 2;
      const y = (component.row - 1) * cellHeight + cellHeight / 2;

      let svgElement;
      switch (component.type) {
        case 'disjoncteur':
          svgElement = this.createSVGElement('rect', {
            x: x - 20, y: y - 20, width: 40, height: 40,
            fill: 'none', stroke: 'black', 'stroke-width': 2
          });
          break;
        case 'prise':
          svgElement = this.createSVGElement('circle', {
            cx: x, cy: y, r: 20,
            fill: 'none', stroke: 'black', 'stroke-width': 2
          });
          break;
        case 'interrupteur':
          svgElement = this.createSVGElement('path', {
            d: `M${x-20},${y} L${x+20},${y-20}`,
            fill: 'none', stroke: 'black', 'stroke-width': 2
          });
          break;
        case 'lampe':
          svgElement = this.createSVGElement('circle', {
            cx: x, cy: y, r: 20,
            fill: 'yellow', stroke: 'black', 'stroke-width': 2
          });
          break;
        default:
          svgElement = this.createSVGElement('text', {
            x: x, y: y, 'text-anchor': 'middle', 'alignment-baseline': 'middle'
          });
          svgElement.textContent = component.name;
      }
      svg.appendChild(svgElement);
    },

    downloadPDF() {
      const svg = this.$refs.svg;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.height.baseVal.value;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'pt', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`${this.cartouche.projectName}.pdf`);
      };
      img.src = 'data:image/svg+xml,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
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
