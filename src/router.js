import { createRouter, createWebHistory } from 'vue-router';
import ElectricalDiagram from './components/ElectricalDiagram.vue';
import FormulaComponent from './components/FormulaComponent.vue';
import FormulaCartouche from './components/FormulaCartouche.vue';

const routes = [
  {
    path: '/',
    name: 'ElectricalDiagram',
    component: ElectricalDiagram
  },
  {
    path: '/formula',
    name: 'FormulaComponent',
    component: FormulaComponent
  },
  {
    path: '/cartouche',
    name: 'FormulaCartouche',
    component: FormulaCartouche
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
