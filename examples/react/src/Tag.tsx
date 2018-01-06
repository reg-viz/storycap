import styled from 'styled-components';
import { withProps } from './helpers';

interface Props {
  large?: boolean;
}

const Tag = withProps<Props, HTMLSpanElement>(styled.span)`
  display: inline-block;
  padding: 0.2em 1em;
  padding: ${props => props.large ? '0.3em 1.6em' : '0.2em 1em'};
  background: #03a9f4;
  border-radius: 3px;
  color: #fff;
  font-size: ${props => props.large ? '1rem' : '0.75rem'};
  font-family: sans-serif;
`;

export default Tag;
