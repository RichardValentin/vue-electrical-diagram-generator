<template>
    <div :style="styles.container">
      <h2 :style="styles.heading">Informations du Cartouche</h2>
      <form @submit.prevent="handleSubmit">
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
        <button type="submit" :style="styles.button">Soumettre</button>
      </form>
    </div>
  </template>
  
  <script>
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
      styles: {
        container: {
          maxWidth: '400px',
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
          marginBottom: '1.5rem'
        },
        input: {
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          transition: 'border-color 0.3s',
          '&:focus': {
            outline: 'none',
            borderColor: '#007bff',
            boxShadow: '0 0 0 2px rgba(0,123,255,0.25)'
          }
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
          '&:hover': {
            backgroundColor: '#0056b3'
          }
        }
      }
    };
  },
  methods: {
    handleSubmit() {
      // Logique de soumission du formulaire
      console.log('Formulaire soumis', this.cartouche);
      this.$router.push('/schema');
    }
  }
};
</script>

  
  <style scoped>
  /* Ajoutez des styles spécifiques si nécessaire */
  </style>
  