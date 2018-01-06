import * as React from 'react';
import { StyledFunction } from 'styled-components';

export const withProps = <T, U>(fn: StyledFunction<React.HTMLProps<U>>): StyledFunction<T & React.HTMLProps<U>> => fn;
