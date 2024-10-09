<template>
    <div :style="styles.container">
      <h2 :style="styles.heading">Connexion</h2>
      <div :style="styles.formSection">
        <input
          type="text"
          :style="styles.input"
          v-model="username"
          placeholder="Nom d'utilisateur"
          @focus="error = ''"
        />
        <input
          type="password"
          :style="styles.input"
          v-model="password"
          placeholder="Mot de passe"
          @focus="error = ''"
        />
        <button
          :style="styles.button"
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </div>
      <p :style="styles.error" v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'LoginPage',
    setup() {
      const router = useRouter();
      const username = ref('');
      const password = ref('');
      const error = ref('');
      const loading = ref(false);
  
      const styles = {
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
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed'
          }
        },
        error: {
          color: '#dc3545',
          fontSize: '0.875rem',
          marginTop: '0.5rem',
          textAlign: 'center'
        }
      };
  
      const handleLogin = async () => {
        try {
          loading.value = true;
          error.value = '';
  
          // Add your authentication logic here
          // Example:
          // const response = await authService.login(username.value, password.value);
  
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
  
          // Store token or user data
          localStorage.setItem('isAuthenticated', 'true');
  
          // Redirect to main page
          router.push('/main');
        } catch (err) {
          error.value = 'Invalid credentials. Please try again.';
        } finally {
          loading.value = false;
        }
      };
  
      return {
        username,
        password,
        error,
        loading,
        styles,
        handleLogin
      };
    }
  };
  </script>
  
  
  <style scoped>
  /* Ajoutez des styles spécifiques si nécessaire */
  </style>
  