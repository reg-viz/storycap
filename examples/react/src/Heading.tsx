import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Heading = styled.div`
  margin: 0;
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  font-family: sans-serif;
  animation: ${fadeIn} 10s linear;

  & > small {
    margin: 0 0 0 0.5em;
    color: #ccc;
    font-size: 0.6em;
    font-weight: normal;
  }
`;

export default Heading;
