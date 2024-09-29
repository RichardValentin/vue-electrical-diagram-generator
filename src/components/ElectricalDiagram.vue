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

      <h2 :style="styles.subHeading">Available Components</h2>
      <div :style="styles.componentList">
        <button
          v-for="(comp, index) in availableComponents"
          :key="index"
          :style="styles.componentButton"
          @click="selectComponent(comp)"
        >
          {{ comp.name }}
        </button>
      </div>

      <div v-if="currentComponent" :style="styles.currentComponent">
        <h3 :style="styles.subHeading">
          {{ parentComponent ? `Adding child to: ${parentComponent.name}` : 'Adding new component' }}
        </h3>
        <input
          type="number"
          name="column"
          placeholder="Column"
          v-model.number="currentComponent.column"
          :style="styles.customInput"
          required
        />
        <input
          type="number"
          name="row"
          placeholder="Row"
          v-model.number="currentComponent.row"
          :style="styles.customInput"
          required
        />
        <button :style="styles.customButton" @click="addComponent">Add Component</button>
      </div>

      <h2 :style="styles.subHeading">Selected Components</h2>
      <div>
        <div v-for="comp in selectedComponents" :key="comp.id" :style="styles.component">
          {{ comp.name }} - Type: {{ comp.type }}, Position: ({{ comp.column }}, {{ comp.row }})
          <div v-if="comp.children.length < 4">
            <button
              :style="styles.componentButton"
              @click="selectComponent({ name: 'Add Child Component', type: 'child' }, comp.id)"
            >
              Add Child Component
            </button>
          </div>
          <div v-for="child in comp.children" :key="child.id">
            {{ child.name }} - Type: {{ child.type }}, Position: ({{ child.column }}, {{ child.row }})
          </div>
        </div>
      </div>

      <button
        type="submit"
        :style="isFormValid ? styles.button : styles.buttonDisabled"
        :disabled="!isFormValid"
      >
        Generate Diagram
      </button>
      <button :style="styles.button" @click="downloadPDF">Download PDF</button>
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
      availableComponents: [],
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
          flexWrap: 'wrap',
          gap: '10px',
        },
        componentButton: {
          padding: '10px 15px',
          fontSize: '16px',
          borderRadius: '4px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        },
        currentComponent: {
          marginTop: '20px',
        },
        customInput: {
          margin: '5px',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        },
        customButton: {
          padding: '8px 12px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
        button: {
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
        buttonHover: {
          transition: 'background-color 0.3s',
        },
        error: {
          color: 'red',
          fontWeight: 'bold',
        },
        component: {
          margin: '5px 0',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '4px',
        },
        svgContainer: {
          marginTop: '20px',
        }
      }
    };
  },
  mounted() {
    this.fetchComponents();
    this.validateForm();
  },
  methods: {
    async fetchComponents() {
      try {
        const response = await fetch('/api/components');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.availableComponents = data;
      } catch (err) {
        console.error('Erreur lors de la récupération des composants', err);
      }
    },
    validateForm() {
      const isCartoucheValid = Object.values(this.cartouche).every(value => value !== '');
      const isAtLeastOneComponent = this.selectedComponents.length > 0;
      this.isFormValid = isCartoucheValid && isAtLeastOneComponent;
    },
    handleCartoucheChange(event) {
      this.cartouche = { ...this.cartouche, [event.target.name]: event.target.value };
      this.validateForm(); // Valider à chaque changement
    },
    selectComponent(component, parentId = null) {
      this.currentComponent = { ...component, column: '', row: '', children: [], parentId };
      this.parentComponent = parentId ? this.selectedComponents.find(comp => comp.id === parentId) : null;
    },
    addComponent() {
      if (!this.currentComponent || !this.currentComponent.column || !this.currentComponent.row) {
        this.errorMessage = 'Veuillez spécifier la colonne et la ligne pour le composant.';
        return;
      }

      const column = parseInt(this.currentComponent.column, 10);
      const row = parseInt(this.currentComponent.row, 10);

      if (column < 1 || column > 10 || row < 1 || row > 5) {
        this.errorMessage = 'Les valeurs de colonne doivent être comprises entre 1 et 10 et celles de ligne entre 1 et 5.';
        return;
      }

      const newComponent = { ...this.currentComponent, column, row, id: Date.now(), children: [] };

      if (this.parentComponent) {
        if (this.parentComponent.children.length >= 4) {
          this.errorMessage = 'Un composant parent ne peut pas avoir plus de 4 enfants.';
          return;
        }

        this.selectedComponents = this.selectedComponents.map(comp => {
          if (comp.id === this.parentComponent.id) {
            return { ...comp, children: [...comp.children, newComponent] };
          }
          return comp;
        });
      } else {
        this.selectedComponents = [...this.selectedComponents, newComponent];
      }

      this.currentComponent = null;
      this.parentComponent = null;
      this.errorMessage = '';
      this.validateForm(); // Valider après ajout de composant
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

      svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40, x2: 790, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
      for (let i = 0; i < 10; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 78, y1: 10, x2: 10 + i * 78, y2: 40, stroke: 'black', 'stroke-width': 0.5 }));
        const text = this.createSVGElement('text', { x: 49 + i * 78, y: 30, 'text-anchor': 'middle', 'font-size': 12 });
        text.textContent = i + 1;
        svg.appendChild(text);
      }

      for (let i = 0; i <= 10; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10 + i * 78, y1: 40, x2: 10 + i * 78, y2: 520, stroke: 'black', 'stroke-width': 0.5 }));
      }
      for (let i = 0; i < 8; i++) {
        svg.appendChild(this.createSVGElement('line', { x1: 10, y1: 40 + i * 60, x2: 790, y2: 40 + i * 60, stroke: 'black', 'stroke-width': 0.5 }));
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
        x: x - 15, y: y - 15, width: 30, height: 30,
        fill: 'none', stroke: 'black'
      }));
      group.appendChild(this.createSVGElement('line', {
        x1: x - 10, y1: y, x2: x + 10, y2: y - 10,
        stroke: 'black'
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
        cx: x, cy: y, r: 5,
        fill: 'none', stroke: 'black'
      }));
      group.appendChild(this.createSVGElement('line', {
        x1: x, y1: y + 5, x2: x, y2: y + 15,
        stroke: 'black'
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
      if (component.type === 'disjoncteur') {
        this.drawCircuitBreaker(svg, x, y, component.characteristics);
      } else if (component.type === 'prise') {
        this.drawOutlet(svg, x, y, component.characteristics);
      } else {
        this.drawGenericComponent(svg, x, y, component.characteristics);
      }

      if (component.children && component.children.length > 0) {
        const childrenY = y + 100;
        const childrenWidth = component.children.length * 100;
        const childrenStartX = x - (childrenWidth / 2) + 50;

        component.children.forEach((child, index) => {
          const childX = childrenStartX + (index * 100);
          this.drawLink(svg, x, y + 20, childX, childrenY - 20);
          this.drawComponentHierarchy(svg, child, childX, childrenY);
        });
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) return;

      const svg = this.$refs.svg;

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      this.drawFrame(svg);

      svg.appendChild(this.createSVGElement('line', {
        x1: 50, y1: 100, x2: 750, y2: 100,
        stroke: 'black', 'stroke-width': '2'
      }));

      svg.appendChild(this.createSVGElement('path', {
        d: 'M750,100 L740,95 L740,105 Z',
        fill: 'black'
      }));

      this.selectedComponents.forEach((comp, index) => {
        const x = 50 + (index * 150);
        const y = 150;
        this.drawComponentHierarchy(svg, comp, x, y);
      });

      try {
        await fetch('/api/components', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.selectedComponents)
        });
      } catch (err) {
        console.error('Erreur lors de l\'envoi des composants', err);
      }
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
    }
  }
};
</script>

<style scoped>
/* Vos styles CSS ici */
</style>
