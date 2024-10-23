<template>
  <div :style="styles.container">
    <h2 :style="styles.heading">Créer un Schéma</h2>

    <div :style="styles.mainWrapper">
      <div :style="styles.gridWrapper">
        <div :style="styles.gridContainer">
          <div v-for="row in gridHeight" :key="`row-${row}`" :style="styles.gridRow">
            <div v-for="col in gridWidth" :key="`cell-${row}-${col}`"
                 :style="getCellStyle(row - 1, col - 1)"
                 @drop="onDrop($event, row - 1, col - 1)"
                 @dragover.prevent
                 @dragenter.prevent
                 @click="selectComponent($event, row - 1, col - 1)">
              <div :style="styles.cellContent">
                {{ getCellContent(row - 1, col - 1) }}
                <div v-if="hasAssociation(row - 1, col - 1)" :style="styles.associationNumber">
                  {{ getAssociationNumber(row - 1, col - 1) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :style="styles.sidebarWrapper">
        <div :style="styles.segmentWrapper">
          <button :style="styles.segmentButton" @click="setSegment('components')">Composants</button>
          <button :style="styles.segmentButton" @click="setSegment('arrivals')">Arrivées</button>
        </div>

        <div :style="styles.componentListWrapper" v-if="segment === 'components'">
          <div :style="styles.componentListTitle">Composants</div>
          <div :style="styles.componentList">
            <div v-for="(comp, index) in availableComponents" :key="index"
                 :style="styles.componentButton"
                 draggable="true"
                 @dragstart="dragStart($event, comp)">
              {{ comp.designation }}
            </div>
          </div>
        </div>

        <div :style="styles.componentListWrapper" v-if="segment === 'arrivals'">
          <div :style="styles.componentListTitle">Arrivées</div>
          <div :style="styles.componentList">
            <div v-for="(arrival, index) in availableArrivals" :key="index"
                 :style="styles.componentButton"
                 draggable="true"
                 @dragstart="dragStart($event, arrival)">
              {{ arrival.designation }}
            </div>
          </div>
          <div :style="styles.arrivalFormWrapper">
            <input v-model="newArrival.description" :style="styles.input" placeholder="Description de l'arrivée" />
            <button :style="styles.button" @click="addArrival">Ajouter</button>
            <button :style="styles.button" @click="cancelArrival">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div :style="styles.buttonGroup">
      <button :style="styles.associateButton"
              @click="associateComponents"
              :disabled="!canAssociateSelected"
              aria-disabled="false">
        Associer les Composants
      </button>
      <button :style="styles.button" @click="saveSchema" aria-disabled="false">
        Générer le Schéma
      </button>
      <button :style="styles.button" @click="cancelAssociation" :disabled="!canCancelAssociation" aria-disabled="false">
        Annuler l'Association
      </button>
    </div>

    <div v-if="errorMessage" :style="styles.errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SchemaCreator',

  data() {
    return {
      availableComponents: [],
      availableArrivals: [],
      selectedComponents: [],
      gridWidth: 21, // Updated to 21 columns
      gridHeight: 5,
      grid: Array.from({ length: 5 }, () => Array(21).fill(null)), // Updated to 21 columns
      draggedComponent: null,
      errorMessage: '',
      selectedCells: [],
      associations: [],
      nextAssociationId: 1,
      segment: 'components', // Added segment property
      newArrival: { description: '' },
      styles: {
        container: {
          maxWidth: '1200px',
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
        mainWrapper: {
          display: 'flex',
          gap: '20px'
        },
        gridWrapper: {
          flex: 2,
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          overflowX: 'auto',
          borderRadius: '4px'
        },
        gridContainer: {
          display: 'table',
          borderCollapse: 'collapse',
          width: '100%',
          tableLayout: 'fixed',
          backgroundColor: '#ffffff',
          border: '1px solid #ced4da',
          borderRadius: '4px',
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
        cellContent: {
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        cellOccupied: {
          backgroundColor: '#e9ecef'
        },
        selectedCell: {
          backgroundColor: '#e3f2fd',
          border: '2px solid #1976d2'
        },
        sidebarWrapper: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        },
        segmentWrapper: {
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        },
        segmentButton: {
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        },
        componentListWrapper: {
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '20px'
        },
        componentListTitle: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#343a40'
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
        associationNumber: {
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px'
        },
        buttonGroup: {
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem'
        },
        button: {
          flex: 1,
          padding: '0.75rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        },
        associateButton: {
          flex: 1,
          padding: '0.75rem',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        },
        arrivalFormWrapper: {
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '20px'
        },
        input: {
          padding: '0.75rem',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          fontSize: '1rem'
        },
        errorMessage: {
          color: '#dc3545',
          marginTop: '1rem',
          textAlign: 'center'
        }
      }
    };
  },

  computed: {
    canAssociateSelected() {
      return this.selectedCells.length >= 2 && this.validateAssociationRules();
    },
    canCancelAssociation() {
      return this.selectedCells.length >= 2 && this.hasExistingAssociation(this.selectedCells[0].component);
    }
  },

  methods: {
    async fetchComponents() {
      try {
        const [response, arrivalResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/components'),
          axios.get('http://localhost:5000/api/arrivals')
        ]);

        console.log('Response from components API:', response);
        console.log('Response from arrivals API:', arrivalResponse);

        if (response.data && arrivalResponse.data) {
          this.availableComponents = response.data;
          this.availableArrivals = arrivalResponse.data;
          console.log('Arrivées chargées:', this.availableArrivals);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des composants ou des arrivées', error);
        this.errorMessage = 'Erreur lors de la récupération des composants ou des arrivées';
      }
    },

    getCellContent(row, col) {
      const component = this.grid[row][col];
      return component ? component.designation : this.getCellNumber(row, col);
    },

    getCellNumber(row, col) {
      return String.fromCharCode(65 + col) + (row + 1);
    },

    dragStart(event, component) {
      this.draggedComponent = { ...component, id: Date.now() };
    },

    validateComponentPlacement(component, row) {
      if (component.type === 'arrival' && row !== 4) {
        this.errorMessage = 'Les arrivées doivent être placées sur la ligne 5';
        return false;
      }
      if (component.type !== 'arrival' && row === 4) {
        this.errorMessage = 'Seules les arrivées peuvent être placées sur la ligne 5';
        return false;
      }
      this.errorMessage = '';
      return true;
    },

    onDrop(event, row, col) {
      if (!this.draggedComponent || this.grid[row][col]) {
        this.errorMessage = 'Cette cellule est déjà occupée.';
        return;
      }

      if (!this.validateComponentPlacement(this.draggedComponent, row)) {
        return;
      }

      const newComponent = {
        ...this.draggedComponent,
        row: row + 1,
        column: col + 1,
        id: Date.now()
      };

      this.grid[row][col] = newComponent;
      this.selectedComponents.push(newComponent);
      this.draggedComponent = null;
    },

    selectComponent(event, row, col) {
      if (!event.ctrlKey || !this.grid[row][col]) return;

      const cellIndex = this.selectedCells.findIndex(cell =>
        cell.row === row && cell.col === col
      );

      if (cellIndex === -1) {
        if (!this.validateSelectionRules(row, col)) {
          return;
        }
        this.selectedCells.push({ row, col, component: this.grid[row][col] });
      } else {
        this.selectedCells.splice(cellIndex, 1);
      }
    },

    validateSelectionRules(row, col) {
      const component = this.grid[row][col];

      if (component.type === 'arrival') {
        this.errorMessage = 'Les arrivées ne peuvent pas être associées';
        return false;
      }

      if (row === 0) {
        const sameRowCells = this.selectedCells.filter(cell => cell.row === 0);
        if (sameRowCells.some(cell => cell.col === col)) {
          this.errorMessage = 'Les composants de la ligne 1 ne peuvent pas être associés entre eux';
          return false;
        }
      }

      this.errorMessage = '';
      return true;
    },

    validateAssociationRules() {
      const rows = this.selectedCells.map(cell => cell.row);
      const uniqueRows = [...new Set(rows)];

      if (uniqueRows.includes(0)) {
        const line1Components = this.selectedCells.filter(cell => cell.row === 0);
        if (line1Components.length === 0) {
          this.errorMessage = 'Les associations de la ligne 1 doivent inclure au moins un composant de la ligne 1';
          return false;
        }
      }

      if (uniqueRows.includes(1)) {
        const line2Components = this.selectedCells.filter(cell => cell.row === 1);
        if (line2Components.length === 0) {
          this.errorMessage = 'Les associations de la ligne 2 doivent inclure au moins un composant de la ligne 2';
          return false;
        }
      }

      if (uniqueRows.includes(2)) {
        const line3Components = this.selectedCells.filter(cell => cell.row === 2);
        if (line3Components.length === 0) {
          this.errorMessage = 'Les associations de la ligne 3 doivent inclure au moins un composant de la ligne 3';
          return false;
        }
      }

      if (uniqueRows.includes(3)) {
        const line4Components = this.selectedCells.filter(cell => cell.row === 3);
        if (line4Components.length === 0) {
          this.errorMessage = 'Les associations de la ligne 4 doivent inclure au moins un composant de la ligne 4';
          return false;
        }
      }

      if (uniqueRows.includes(4)) {
        this.errorMessage = 'Les arrivées ne peuvent pas être associées';
        return false;
      }

      this.errorMessage = '';
      return true;
    },

    getCellStyle(row, col) {
      const isSelected = this.selectedCells.some(cell =>
        cell.row === row && cell.col === col
      );

      return {
        ...this.styles.gridCell,
        ...(this.grid[row][col] ? this.styles.cellOccupied : {}),
        ...(isSelected ? this.styles.selectedCell : {})
      };
    },

    hasAssociation(row, col) {
      return this.getAssociationNumber(row, col) !== null;
    },

    getAssociationNumber(row, col) {
      const association = this.associations.find(assoc =>
        assoc.components.some(comp => comp === this.grid[row][col])
      );
      return association ? association.id : null;
    },

    hasExistingAssociation(component) {
      return this.associations.some(association =>
        association.components.some(comp => comp.id === component.id)
      );
    },

    associateComponents() {
      if (!this.canAssociateSelected) return;

      const newAssociation = {
        id: this.nextAssociationId++,
        components: this.selectedCells.map(cell => this.grid[cell.row][cell.col])
      };

      this.associations.push(newAssociation);
      this.selectedCells = [];
      this.errorMessage = '';
    },

    cancelAssociation() {
      if (!this.canCancelAssociation) return;

      const associationIndex = this.associations.findIndex(assoc =>
        assoc.components.some(comp => this.selectedCells.some(cell => cell.component.id === comp.id))
      );

      if (associationIndex !== -1) {
        this.associations.splice(associationIndex, 1);
        this.selectedCells = [];
        this.errorMessage = '';
      }
    },

    saveSchema() {
      const schemaData = {
        cartouche: this.$store.state.cartouche,
        selectedComponents: this.selectedComponents,
        grid: this.grid,
        associations: this.associations
      };
      localStorage.setItem('schema', JSON.stringify(schemaData));
      this.$router.push('/visualization');
    },

    setSegment(segment) {
      this.segment = segment;
    },

    addArrival() {
      if (this.newArrival.description.trim() !== '') {
        const newArrival = {
          type: 'arrival',
          designation: this.newArrival.description,
          row: 5, // Default row for arrivals
          column: 1 // Default column, can be adjusted as needed
        };
        this.availableArrivals.push(newArrival);
        this.newArrival.description = '';
      }
    },

    cancelArrival() {
      this.newArrival.description = '';
    }
  },

  mounted() {
    this.fetchComponents();
  }
};
</script>

<style scoped>
/* Ajoutez des styles spécifiques si nécessaire */
</style>
