<template>
    <div :style="styles.container">
        <h2 :style="styles.heading">Créer un Schéma</h2>
        <div :style="styles.gridWrapper">
            <div :style="styles.gridContainer">
                <div v-for="row in gridHeight" :key="`row-${row}`" :style="styles.gridRow">
                    <div v-for="col in gridWidth" :key="`cell-${row}-${col}`" :style="getCellStyle(row - 1, col - 1)"
                        @drop="onDrop($event, row - 1, col - 1)" @dragover.prevent @dragenter.prevent>
                        {{ getCellContent(row - 1, col - 1) }}
                    </div>
                </div>
            </div>
        </div>
        <div :style="styles.componentList">
            <div v-for="(comp, index) in availableComponents" :key="index" :style="styles.componentButton"
                draggable="true" @dragstart="dragStart($event, comp)">
                {{ comp.name }}
            </div>
        </div>
        <button :style="styles.button" @click="saveSchema">Sauvegarder le Schéma</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
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
            draggedComponent: null,
            errorMessage: '',
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
                    transition: 'background-color 0.3s',
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
        saveSchema() {
            const schemaData = {
                cartouche: this.$store.state.cartouche,
                selectedComponents: this.selectedComponents,
                grid: this.grid
            };
            localStorage.setItem('schema', JSON.stringify(schemaData));
            this.$router.push('/visualization');
        }
    }
};
</script>


<style scoped>
/* Ajoutez des styles spécifiques si nécessaire */
</style>