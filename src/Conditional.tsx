interface ConditionalProps {
  pred: boolean;
  whenTrue: JSX.Element;
  whenFalse: JSX.Element;
}

export function Conditional({ pred, whenTrue, whenFalse }: ConditionalProps) {
  return pred ? whenTrue : whenFalse;
}
