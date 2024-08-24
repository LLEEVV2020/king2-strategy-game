// index.tsx
import React, { useState } from 'react';
import Game from './Game';       

const HomePage: React.FC = () => {
 
  return (
    <div style={{ padding: '20px' }}>
      <h1>games</h1>
      <Game  /> 
    </div>
  );
};

export default HomePage;