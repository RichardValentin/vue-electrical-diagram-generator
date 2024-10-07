<template>
  <div :style="styles.container">
    <h2 :style="styles.heading">Créer un Schéma</h2>

    <!-- Grille pour placer les composants -->
    <div :style="styles.gridWrapper">
      <div :style="styles.gridContainer">
        <div v-for="row in gridHeight" :key="`row-${row}`" :style="styles.gridRow">
          <div v-for="col in gridWidth" :key="`cell-${row}-${col}`"
               :style="getCellStyle(row - 1, col - 1)"
               @drop="onDrop($event, row - 1, col - 1)"
               @dragover.prevent
               @dragenter.prevent>
            {{ getCellContent(row - 1, col - 1) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des composants disponibles -->
    <div :style="styles.componentList">
      <div v-for="(comp, index) in availableComponents" :key="index"
           :style="styles.componentButton"
           draggable="true"
           @dragstart="dragStart($event, comp)">
        {{ comp.designation }}
      </div>
    </div>

    <!-- Bouton de sauvegarde du schéma -->
    <button :style="styles.button" @click="saveSchema">Sauvegarder le Schéma</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      availableComponents: [], // Composants récupérés de l'API
      selectedComponents: [],  // Composants sélectionnés et placés sur la grille
      gridWidth: 21,           // Largeur de la grille
      gridHeight: 5,           // Hauteur de la grille
      grid: Array.from({ length: 5 }, () => Array(21).fill(null)), // Grille initiale vide
      draggedComponent: null,  // Composant actuellement en cours de drag
      errorMessage: '',        // Message d'erreur pour des opérations invalides
      styles: {                // Styles en ligne pour le composant
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
        gridWrapper: {
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        },
        gridContainer: {
          display: 'table',
          borderCollapse: 'collapse',
          width: 'fit-content',
          minWidth: '100%',
          tableLayout: 'fixed',
          backgroundColor: '#ffffff',
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
        componentList: {
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        },
        componentButton: {
          padding: '12px 16px',
          backgroundColor: '#e9ecef',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          cursor: 'move',
          transition: 'background-color 0.3s'
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
    // Récupération des composants disponibles depuis l'API
    async fetchComponents() {
      try {
        const response = await axios.get('http://localhost:5000/api/components');
        this.availableComponents = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des composants', error);
      }
    },
    // Gestion du drag and drop des composants
    dragStart(event, component) {
      this.draggedComponent = { ...component, id: Date.now() }; // Ajout d'un ID unique au composant
    },
    // Gestion de l'événement drop sur la grille
    onDrop(event, row, col) {
      if (this.draggedComponent && !this.grid[row][col]) {
        const newComponent = {
          ...this.draggedComponent,
          row: row + 1,
          column: col + 1,
        };
        this.grid[row][col] = newComponent;
        this.selectedComponents.push(newComponent);
      } else if (this.grid[row][col]) {
        this.errorMessage = 'Cette cellule est déjà occupée.';
      } else {
        this.errorMessage = 'Impossible de déposer le composant ici.';
      }
      this.draggedComponent = null;
    },
    // Style de la cellule en fonction de son contenu
    getCellStyle(row, col) {
      return {
        ...this.styles.gridCell,
        ...(this.grid[row][col] ? this.styles.cellOccupied : {})
      };
    },
    // Contenu de la cellule : soit le nom du composant, soit la position
    getCellContent(row, col) {
      const component = this.grid[row][col];
      return component ? component.designation : this.getCellNumber(row, col);
    },
    // Numéro de la cellule basé sur la position
    getCellNumber(row, col) {
      return String.fromCharCode(65 + col) + (row + 1); // Ex: A1, B2, etc.
    },
    // Sauvegarder le schéma dans localStorage
    saveSchema() {
      const schemaData = {
        cartouche: this.$store.state.cartouche,
        selectedComponents: this.selectedComponents,
        grid: this.grid
      };
      localStorage.setItem('schema', JSON.stringify(schemaData));
      this.$router.push('/visualization');
    }
  },
  // Récupérer les composants disponibles dès que le composant est monté
  mounted() {
    this.fetchComponents();
  }
};
</script>

<style scoped>
/* Ajoutez des styles spécifiques si nécessaire */
</style>
