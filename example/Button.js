import styled from 'styled-components';

const Button = styled.button`
  display: inline-block;
  margin: 0;
  padding: .6em 2.2em;
  background: transparent;
  border: 1px solid ${props => props.primary ? '#03a9f4' : '#000'};
  border-radius: 3px;
  color: ${props => props.primary ? '#03a9f4' : '#000'};
  text-align: center;
  font-family: sans-serif;
  font-size: 1rem;
  cursor: pointer;
`;

export default Button;
