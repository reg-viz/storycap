import styled from 'styled-components';

const Container = styled.div`
  padding: 5em 15px;
  background: #673ab7;
  color: #fff;
  font-family: sans-serif;
  font-weight: bold;
  text-align: center;

  @media (min-width: 768px) {
    background: #3f51b5;
  }

  @media (min-width: 992px) {
    background: #2196f3;
  }

  @media (min-width: 1200px) {
    background: #009688;
  }
`;

export default Container;
