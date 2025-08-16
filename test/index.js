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

  it("ref", () => {

  });
  
  it("drop", () => { });
});

// const getCounter = (counter) => {
//   using c = counter.ref();
//   console.log("counter end", c);
// };

// {
//   // usage
//   const free = (a) => void console.log(`dispose ${JSON.stringify(a)}`, a.value = 0);
//   const smile = console.log.bind(null, "free :3");
//   const v = { value: 5 }
//   const counter = new RefCounter(v, free);
//   {
//     using a = counter.ref();
//     console.log("inner end a", a, v);
//     {
//       using b = counter.ref();
//       console.log("inner end b", b, v);
//     }
//     // counter.drop();
//     console.log("check counter ref dropped", counter.dropped);
//     getCounter(counter);
//   }
//   console.log("end", v, "check counter ref dropped", counter.dropped);
// }


// {
//   // usage
//   const free = (a) => void console.log(`dispose ${JSON.stringify(a)}`, a.value = 0);
//   const v = {
//     value: 5,
//     [Symbol.dispose](self) {
//       console.log("BOOM!");
//       this.value = Math.random();
//     }
//   };
//   const counter = new RefCounter(v, free);
//   {
//     using a = counter.ref();
//     console.log("inner end a", a, v);
//     {
//       using b = counter.ref();
//       console.log("inner end b", b, v);
//     }
//     // counter.drop();
//     console.log("check counter ref dropped", counter.dropped);
//     getCounter(counter);
//   }
//   console.log("end", v, "check counter ref dropped", counter.dropped, counter);

//   {
//     using test = v;
//   }
//   console.log(v)
// }