# Referential Counter 
- Concept of ownerships and disposable of Node >=v24

## Types
```ts
class RefCounter<T, D = ((entity: T) => void)> {
  constructor(entity: T, onDispose?: D);
  ref(): T;
  drop(): void;
  move(): RefCounter<T, D>;
  dropped: boolean;
  count: number;
}
```

## Examples

```js
  {
    const instance = new Stream('./bin/temp/file.log');
    const free = stream => void stream.close();
    const counter = new RefCounter(instance, free);
    {
      using stream = counter.ref();
      stream.setEncoding('utf-8');
      for await (const chunk of stream){
        // read
      }
    } // stream closed here
  }

  {
    const instance = new Stream('./bin/temp/file.log');
    const free = stream => void stream.close();
    const counter = new RefCounter(instance, free);
    using stream = counter.ref();
    stream.setEncoding('utf-8');
    for await (const chunk of stream){
        // read
    }
    {
      using stream = counter.ref();
      for await (const chunk of stream){
        // read
      }
    }
  } // stream closed here

```