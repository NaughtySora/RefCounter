'use strict';

class RefCounter {
  #entity = null;
  #dispose = null;
  #references = 0;
  #dropped = false;
  #originalDispose = null;

  constructor(entity, onDispose) {
    const original = this.#originalDispose = entity?.[Symbol.dispose];
    this.#dispose = original ?? onDispose ?? null;
    if (this.#dispose === null) {
      throw new Error("Can't find references' [Symbol.dispose] method");
    }
    Object.defineProperty(entity, Symbol.dispose, {
      value: () => {
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

  get dropped() {
    return this.#dropped;
  }
}

module.exports = { RefCounter };
