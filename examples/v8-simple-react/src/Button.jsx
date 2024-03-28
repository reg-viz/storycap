import React from 'react';

export const Button = ({ children, onClick }) => (
  <button className='button' onClick={onClick} type="button">
    {children}
  </button>
);
