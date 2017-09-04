/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-confusing-arrow */
import styled from 'styled-components';

const Heading = styled.div`
  margin: 0;
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  font-family: sans-serif;

  & > small {
    margin: 0 0 0 0.5em;
    color: #ccc;
    font-size: 0.6em;
    font-weight: normal;
  }
`;

export default Heading;
