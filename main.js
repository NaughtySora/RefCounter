'use strict';

class RefCounter {
  #entity = null;
  #dispose = null;
  #references = 0;
  #dropped = false;
  #originalDispose = null;

  constructor(entity, onDispose) {
    if (
      entity === null ||
      (typeof entity !== "object" && typeof entity !== "function")
    ) {
      throw new Error("Invalid target for ref counter, an object required");
    }
    const original = this.#originalDispose = entity?.[Symbol.dispose];
    const dispose = this.#dispose = original ?? onDispose ?? null;
    if (dispose === null) {
      throw new Error("Can't find reference's [Symbol.dispose] method");
    }
    Object.defineProperty(entity, Symbol.dispose, {
      value: () => {
        if (this.dropped) return;
        this.#references--;
        if (this.#references !== 0) return;
        this.#dispose.call(this.#entity, this.#entity);
        this.drop();
      },
      enumerable: false,
      writable: true,
      configurable: true,
    });
    this.#entity = entity;
  }

  ref() {
    if (this.#dropped) {
      throw new Error("Reference was dropped");
    }
    this.#references++;
    return this.#entity;
  }

  drop() {
    if (this.#dropped) return;
    Object.defineProperty(this.#entity, Symbol.dispose, {
      value: this.#originalDispose,
      enumerable: false,
      writable: true,
      configurable: true,
    });
    this.#entity = null;
    this.#dispose = null;
    this.#references = 0;
    this.#dropped = true;
    this.#originalDispose = null;
  }

  move() {
    const entity = this.#entity;
    const dispose = this.#dispose;
    this.drop();
    return new RefCounter(entity, dispose);
  }

  get dropped() {
    return this.#dropped;
  }

  get count() {
    return this.#references;
  }
}

module.exports = { RefCounter };
