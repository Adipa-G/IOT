import './App.css';

import { HashRouter as Router } from 'react-router';

import Layout from '../layout/Layout'

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
