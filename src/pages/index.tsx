// index.tsx
import React, { useState } from 'react';
import PutiMi from './PutiMi';
import Soldati from './Soldati';


const HomePage: React.FC = () => {
 
  return (
    <div style={{ padding: '20px' }}>
      <h1>games</h1>
      <PutiMi  /> -------------
        <Soldati />
      
    </div>
  );
};

export default HomePage;