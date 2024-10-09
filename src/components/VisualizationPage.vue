<template>
    <div :style="styles.container">
      <h2 :style="styles.heading">Visualisation du Schéma</h2>
      <div :style="styles.svgContainer">
        <svg ref="svg" width="900" height="600"></svg>
      </div>
      <button :style="styles.button" @click="downloadPDF">Télécharger PDF</button>
    </div>
  </template>
 <script>
 import { jsPDF } from 'jspdf';
 import 'jspdf-autotable';
 
 export default {
   data() {
     return {
       cartouche: {},
       selectedComponents: [],
       grid: [],
       styles: {
         container: {
           maxWidth: '960px',
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
         svgContainer: {
           marginTop: '20px',
           border: '1px solid #ced4da',
           backgroundColor: '#f8f9fa',
           padding: '10px',
           borderRadius: '8px',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center'
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
           marginTop: '1rem',
           '&:hover': {
             backgroundColor: '#0056b3'
           }
         }
       }
     };
   },
   methods: {
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
         { x: 280, y: 580, content: this.cartouche.date || '', size: 8, color: '#000000' },
         { x: 320, y: 580, content: 'Création', size: 8, color: '#000000' },
         { x: 405, y: 535, content: this.cartouche.client || '', size: 12, color: '#000000' },
         { x: 405, y: 565, content: this.cartouche.building || '', size: 10, color: '#000000' },
         { x: 405, y: 580, content: 'Régal - Pointe-Noire', size: 10, color: '#000000' },
         { x: 605, y: 535, content: this.cartouche.projectName || '', size: 10, color: '#000000' },
         { x: 605, y: 565, content: this.cartouche.reference || '', size: 10, color: '#000000' },
         { x: 770, y: 580, content: this.cartouche.folioNumber || '', size: 14, anchor: 'end', weight: 'bold', color: '#000000' },
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
           title: this.cartouche.projectName || '',
           subject: 'Schéma électrique',
           author: 'SUDELEC',
           keywords: 'schéma, électrique, ' + this.cartouche.projectName,
           creator: 'SUDELEC Schema Generator'
         });
 
         // Sauvegarder le PDF
         pdf.save(`${this.cartouche.projectName || 'Schéma'}.pdf`);
 
         // Nettoyer
         URL.revokeObjectURL(url);
       };
 
       img.src = url;
     }
   },
   mounted() {
     const schemaData = JSON.parse(localStorage.getItem('schema'));
     if (schemaData) {
       this.cartouche = schemaData.cartouche || {};
       this.selectedComponents = schemaData.selectedComponents;
       this.grid = schemaData.grid;
       this.generateSchema();
     }
   }
 };
 </script>
 
  
  <style scoped>
  /* Ajoutez des styles spécifiques si nécessaire */
  </style>
  