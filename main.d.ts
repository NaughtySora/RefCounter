
export class RefCounter<T, D = ((entity: T) => void)> {
  constructor(entity: T, onDispose?: D);
  ref(): T;
  drop(): void;
  move(): RefCounter<T, D>;
  dropped: boolean;
  count: number;
}