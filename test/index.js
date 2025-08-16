'use strict';

const assert = require("node:assert");
const { describe, it } = require("node:test");
const { RefCounter } = require("../main");

describe("unit", () => {
  describe("constructor", () => {
    it("validation", () => {
      const INVALID_OBJECT = "Invalid target for ref counter, an object required";
      const NO_SYMBOL_DISPOSE = "Can't find reference's [Symbol.dispose] method";
      assert.throws(() => {
        new RefCounter({ a: 1 });
      }, { message: NO_SYMBOL_DISPOSE });
      assert.throws(() => {
        new RefCounter(null);
      }, { message: INVALID_OBJECT });
      assert.throws(() => {
        new RefCounter();
      }, { message: INVALID_OBJECT });
      assert.throws(() => {
        new RefCounter(1);
      }, { message: INVALID_OBJECT });
    });
    it("[Symbol.dispose]", () => {
      const instance = {
        a: 0,
        [Symbol.dispose]() { },
      };
      const dispose = instance[Symbol.dispose];
      const counter = new RefCounter(instance);
      using i = counter.ref();
      assert.deepStrictEqual(instance, i);
      assert.ok(dispose !== i[Symbol.dispose]);
    });
    it("onDispose", () => {
      const dispose = function () { }
      const instance = { a: 0, };
      const counter = new RefCounter(instance, dispose);
      using i = counter.ref();
      assert.deepStrictEqual(instance, i);
      assert.ok(dispose !== i[Symbol.dispose]);
    });
  });

  describe("ref", () => {
    it("[Symbol.dispose]", () => {
      const instance = {
        a: 1,
        [Symbol.dispose]() {
          this.a = 2;
        }
      };
      const counter = new RefCounter(instance);
      { using i = counter.ref(); }
      assert.strictEqual(instance.a, 2);
      assert.strictEqual(counter.dropped, true);
      assert.strictEqual(counter.count, 0);
    });
    it("onDispose", () => {
      const free = entity => void (delete entity.a);
      const instance = { a: 1, };
      const counter = new RefCounter(instance, free);
      { using i = counter.ref(); }
      assert.strictEqual(instance.a, undefined);
      assert.strictEqual(counter.dropped, true);
      assert.strictEqual(counter.count, 0);
    });
  });

  it("drop", () => {
    const instance = new Map([["a", 42]]);
    const instance2 = { a: 0, [Symbol.dispose]() { } }
    const dispose = instance[Symbol.dispose]; // undefined [node 24]
    const dispose2 = instance2[Symbol.dispose];
    const counter = new RefCounter(instance, map => map.clear());
    const counter2 = new RefCounter(instance2);
    assert.throws(() => {
      assert.deepStrictEqual(instance2[Symbol.dispose], dispose2);
    }, { message: /Expected values to be strictly deep-equal/ });
    counter.drop();
    counter2.drop();
    assert.throws(() => {
      using ref = counter.ref();
      using ref2 = counter2.ref();
    }, { message: "Reference was dropped" });
    assert.strictEqual(counter.dropped, true);
    assert.strictEqual(counter.count, 0);
    assert.deepStrictEqual(instance[Symbol.dispose], dispose);
    assert.deepStrictEqual(instance2[Symbol.dispose], dispose2);
  });
});

describe("integrated", () => {
  it("returning counter", () => {
    const produceCounter = () => {
      const instance = { a: 1, [Symbol.dispose]() { this.a = 42 } };
      const counter = new RefCounter(instance);
      using ref = counter.ref();
      assert.deepStrictEqual(ref, instance);
      assert.strictEqual(ref.a, instance.a);
      assert.strictEqual(counter.count, 1);
      assert.strictEqual(counter.dropped, false);
      return {
        moved: counter.move(),
        counter,
        instance,
      };
    };
    let outer = null;
    let outerCounter = null;
    {
      const { moved, counter, instance } = produceCounter();
      assert.strictEqual(instance.a, 1);
      assert.strictEqual(counter.count, 0);
      assert.strictEqual(counter.dropped, true);
      assert.strictEqual(moved.count, 0);
      assert.strictEqual(moved.dropped, false);
      using ref = moved.ref();
      assert.deepStrictEqual(instance, ref);
      assert.strictEqual(ref.a, 1);
      assert.strictEqual(moved.count, 1);
      assert.strictEqual(moved.dropped, false);
      assert.ok(moved !== counter);
      outer = ref;
      outerCounter = moved;
    }
    assert.strictEqual(outer.a, 42);
    assert.strictEqual(outerCounter.dropped, true);
    assert.strictEqual(outerCounter.count, 0);
  });

  it("passing counter into function", () => {
    const getCounter = (counter, instance) => {
      using c = counter.ref();
      assert.strictEqual(counter.count, 2);
      assert.deepStrictEqual(c, instance);
    };
    const free = a => void (a.value = undefined);
    const instance = { value: 5 };
    const counter = new RefCounter(instance, free);
    {
      using a = counter.ref();
      assert.strictEqual(counter.count, 1);
      assert.deepStrictEqual(a, instance);
      assert.strictEqual(instance.value, 5);
      {
        using b = counter.ref();
        assert.strictEqual(counter.count, 2);
        assert.deepStrictEqual(b, instance);
        assert.strictEqual(instance.value, 5);
      }
      assert.strictEqual(counter.count, 1);
      getCounter(counter, instance);
      assert.strictEqual(counter.count, 1);
      assert.strictEqual(instance.value, 5);
    }
    assert.strictEqual(counter.count, 0);
    assert.strictEqual(counter.dropped, true);
    assert.strictEqual(instance.value, undefined);
  });
});
